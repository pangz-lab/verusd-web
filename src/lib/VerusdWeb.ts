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

interface LocalServerConfig {
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
    localServerConfig: LocalServerConfig
}

export class VerusdWeb implements ServerInterface {
    private zmqClient: ZmqClient;
    private httpServer: HttpServer;
    private wsServer: WsServer;
    private daemonConfig: DaemonConfig;
    private localServerConfig: LocalServerConfig;
    private clientHooks: ClientMessageHookInterface[] = [];
    private customApiRoutes: RouteConfig[] = [];
    private zmqEventsProvider: ZmqEventsHandlerProvider;

    get zmq(): ZmqEventsHandlerProvider { return this.zmqEventsProvider; }

    constructor(config: VerusdWebConfig) {
        this.daemonConfig = config.daemonConfig;
        this.localServerConfig = config.localServerConfig;
        this.wsServer = new WsServer();
        this.zmqEventsProvider = new ZmqEventsHandlerProvider(this.wsServer);

        const zmqEventsHandler = this.zmqEventsProvider.eventsHandler;

        this.zmqClient = new ZmqClient(
            this.daemonConfig.zmq.host,
            this.daemonConfig.zmq.port,
            this.wsServer,
            zmqEventsHandler
        );

        this.customApiRoutes = (config.localServerConfig.customApiRoutes !== undefined)? config.localServerConfig.customApiRoutes : [];
        this.clientHooks = (config.localServerConfig.ws?.clientHooks !== undefined)? config.localServerConfig.ws.clientHooks : []

        this.httpServer = new HttpServer({
            port: this.localServerConfig.port,
            wsServer: this.wsServer,
            clientHooks: this.clientHooks,
            customApiRoutes: this.customApiRoutes,
            apiToken: config.localServerConfig.apiToken ?? ''
        });

        this.initDaemonRpcConnection(config?.localServerConfig.excludedMethods ?? []);
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