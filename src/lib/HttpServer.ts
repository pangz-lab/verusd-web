import http from 'http';
import helmet from 'helmet';
import express, { Express } from 'express';
import { ServerInterface } from './ServerInterface';
import { WsServer } from './WsServer';
import { RpcService } from './RpcService';
import { RpcServiceConfig } from './RpcServiceConfig';
import { RestApiRoutesService, type RouteConfig } from './RestApiRoutesService';
import { RestApiService } from './RestApiService';

export interface ClientMessageHookInterface {
    messageReceived(client: WebSocket, rawMessage?: string): Object;
}

export interface HttpServerConfig {
    port: number,
    wsServer: WsServer,
    clientHooks: ClientMessageHookInterface[],
    customApiRoutes: RouteConfig[],
    apiToken: string
}

export class HttpServer implements ServerInterface {
    private expressApp?: Express;
    private wsServer: WsServer;
    private port: number;
    private clientHookInterface: ClientMessageHookInterface[] = [];
    private customApiRoutes: RouteConfig[] = [];
    private apiToken = '';
    private readonly wsSuffix = 'verusd/web';

    constructor(config: HttpServerConfig) {
        this.port = config.port;
        this.wsServer = config.wsServer;
        this.clientHookInterface = config.clientHooks;
        this.apiToken = config.apiToken;
        if(config.customApiRoutes !== undefined && config.customApiRoutes.at(0) !== undefined) {
            this.customApiRoutes = config.customApiRoutes;
        }
    }

    close(): boolean {
        this.expressApp = undefined;
        return true;
    }

    open(): HttpServer {
        this.wsServer.open().receive();
        this.expressApp = express();
        this.expressApp
            .use(helmet())
            .use(express.json())
            .use(express.urlencoded({ extended: true }));
        
        this.setupDefaultRpcApis(this.expressApp);
        this.setupCustomApis(this.expressApp);

        const httpServer = this.expressApp.listen(this.port!);
        this.attachWsServerConnection(httpServer);
        
        console.log(`HTTP and WS Server running in port ${this.port} ...`);
        return this;
    }

    private attachWsServerConnection(httpServer: http.Server): void {
        if(this.wsServer.socket === undefined) {
            throw new Error("Websocket Server is not running!");
        }
        
        const wss = this.wsServer.socket;
        const clientHook = this.clientHookInterface;
        httpServer.on('upgrade', (request, socket, head) => {
            const pathname = request.url;

            if (pathname === `/${this.wsSuffix}`) {
                wss.handleUpgrade(request, socket, head, function done(ws) {
                    ws.send(JSON.stringify({data: 'connection established'}));
                    
                    ws.on('message', function message(data) {    
                        console.log('received: %s', data);
                        const convData = data as unknown as string;
                        if(clientHook[0] !== undefined) {
                            HttpServer.iterateHookOperations(ws, convData, {}, 'messageReceived', clientHook);
                            return;
                        }

                        const d = JSON.parse(convData);
                        if(!RpcServiceConfig.getAllowedMethods().includes(d.m.trim())) {
                            ws.send(JSON.stringify({result: 'unknown rest api method', error: true}));
                            return;
                        }

                        RpcService.sendChainRequest(d.m, d.p)
                        .then((v) => { ws.send(JSON.stringify(v)); });
                    });

                    ws.on('error', console.error);
                });
            } else {
                socket.destroy();
            }
        });
    }

    private static iterateHookOperations(
        ws: any,
        data: string,
        previousHookResult: Object,
        methodName: string,
        hooks: ClientMessageHookInterface[]): Object[] {
        let results: Object[] = [];

        hooks.forEach((currentHook: ClientMessageHookInterface, _index: number) => {
            const method = Reflect.get(currentHook, methodName);
            if (typeof method === 'function') {
                const result = Reflect.apply(method, currentHook, [ws, data, previousHookResult]);
                results.push(result as Object);
            }
        });

        return results;
    }

    private setupDefaultRpcApis(app: Express): void {
        const routes: RouteConfig[] = [
            { method: 'get', apiVersion: 1, route: this.wsSuffix, controller: RestApiService.routeController }
        ];
        RestApiRoutesService.generate(app, routes, this.apiToken);
    }
    
    private setupCustomApis(app: Express): void {
        RestApiRoutesService.generate(app, this.customApiRoutes, this.apiToken);
    }
}