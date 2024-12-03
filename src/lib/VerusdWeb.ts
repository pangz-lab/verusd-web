import { ServerInterface } from "./ServerInterface";
import { HttpServer, type ClientMessageHookInterface } from "./HttpServer";
import { ZmqClient } from "./ZmqClient";
import { WsServer } from "./WsServer";
import { ZmqEventsHandlerProvider } from "./ZmqEventsHandlerProvider";
import { RpcService } from "./RpcService";
import { RpcServiceConfig } from "./RpcServiceConfig";
import type { RouteConfig } from "./RestApiRoutesService";

interface ZmqServer {
    host: string,
    port: number
}

interface LocalServerOptions {
    port: number,
    customApiRoutes?: RouteConfig[],
    apiToken?: string,
    excludedMethods?: string[],
    ws?: { clientHooks?: ClientMessageHookInterface[] }
}

interface DaemonConfig {
    host: string
    port?: number
    user?: string
    password?: string
    zmq: ZmqServer
}

export interface VerusdWebConfig {
    daemonConfig: DaemonConfig
    localServerOptions: LocalServerOptions
}

export class VerusdWeb implements ServerInterface {
    private zmqClient: ZmqClient;
    private httpServer: HttpServer;
    private wsServer: WsServer;
    private daemonConfig: DaemonConfig;
    private localServerOptions: LocalServerOptions;
    private clientHooks: ClientMessageHookInterface[] = [];
    private customApiRoutes: RouteConfig[] = [];
    private zmqEventsProvider: ZmqEventsHandlerProvider;

    get zmq(): ZmqEventsHandlerProvider { return this.zmqEventsProvider; }

    constructor(config: VerusdWebConfig) {
        this.daemonConfig = config.daemonConfig;
        this.localServerOptions = config.localServerOptions;
        this.wsServer = new WsServer();
        this.zmqEventsProvider = new ZmqEventsHandlerProvider(this.wsServer);

        const zmqEventsHandler = this.zmqEventsProvider.e[0] !== undefined ?
            this.zmqEventsProvider.eventsHandler :
            undefined

        this.zmqClient = new ZmqClient(
            this.daemonConfig.zmq.host,
            this.daemonConfig.zmq.port,
            this.wsServer,
            zmqEventsHandler
        );

        this.customApiRoutes = (config.localServerOptions.customApiRoutes !== undefined)? config.localServerOptions.customApiRoutes : [];
        this.clientHooks = (config.localServerOptions.ws?.clientHooks !== undefined)? config.localServerOptions.ws.clientHooks : []

        this.httpServer = new HttpServer({
            port: this.localServerOptions.port,
            wsServer: this.wsServer,
            clientHooks: this.clientHooks,
            customApiRoutes: this.customApiRoutes,
            apiToken: config.localServerOptions.apiToken ?? ''
        });

        this.initDaemonRpcConnection(config?.localServerOptions.excludedMethods ?? []);
    }

    open(): ServerInterface {
        this.httpServer.open();
        this.zmqClient.connect();
        return this;
    }

    close(): boolean {
        if(this.zmqClient != undefined) { this.zmqClient.disconnect(); }
        if(this.httpServer != undefined) { this.httpServer.close(); }
        return true;
    }

    private initDaemonRpcConnection(excludedMethods: string[]): void {
        const host = (this.daemonConfig.port === undefined) ?
            this.daemonConfig.host :
            `${this.daemonConfig.host}:${this.daemonConfig.port}`;

        RpcServiceConfig.set(excludedMethods);
        RpcService.init(host, 'Basic ' + btoa(`${this.daemonConfig.user}:${this.daemonConfig.password}`));
    }
}