import http from 'http';
import helmet from 'helmet';
import express, { Express } from 'express';
import { ServerInterface } from './ServerInterface';
import { WsServer } from './WsServer';
import { RpcService } from './RpcService';
import { RpcServiceConfig } from './RpcServiceConfig';

export interface ClientMessageHookInterface {
    messageReceived(client: WebSocket, rawMessage?: string): Object;
}

export class HttpServer implements ServerInterface {
    private expressApp?: Express;
    private wsServer: WsServer;
    private port: number;
    private clientHookInterface: ClientMessageHookInterface[] = [];
    private readonly wsSuffix = '/verus/wss';
    
    constructor(port: number, wsServer: WsServer, clientHookInterface: ClientMessageHookInterface[] = []) {
        this.port = port;
        this.wsServer = wsServer;
        this.clientHookInterface = clientHookInterface;
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
        
        const httpServer = this.expressApp.listen(this.port!);
        this.attachWsServerConnection(httpServer);
        console.log("HTTP and WS Server running in port " + this.port! + "...");
        return this;
    }

    private attachWsServerConnection(httpServer: http.Server): void {
        if(this.wsServer.socket === undefined) {
            throw new Error("Websocket Server is not running.");
        }
        const wss = this.wsServer.socket;
        const clientHook = this.clientHookInterface;
        httpServer.on('upgrade', (request, socket, head) => {
            const pathname = request.url;
            if (pathname === this.wsSuffix) {
                wss.handleUpgrade(request, socket, head, function done(ws) {
                    ws.send(JSON.stringify({data: 'connection established'}));
                    ws.on('message', function message(data) {
                        console.log('received: %s', data);
                        
                        const convData = data as unknown as string;
                        if(clientHook[0] !== undefined) {
                            HttpServer.iterateHookOperations(
                                ws,
                                convData,
                                {},
                                'messageReceived',
                                clientHook
                            );
                        } else {
                            const d = JSON.parse(convData);
                            if(!RpcServiceConfig.getAllowedMethods().includes(d.m.trim())) {
                                ws.send(JSON.stringify({result: 'unknown method'}));
                                return;
                            }

                            RpcService.sendChainRequest(d.m, d.p)
                            .then((v) => {
                                ws.send(JSON.stringify(v));
                            });
                        }
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
}