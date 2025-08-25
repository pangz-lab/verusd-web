import { ServerInterface } from "./ServerInterface";
import { HttpServer, type ClientMessageHookInterface } from "./HttpServer";
import { ZmqClient } from "./ZmqClient";
import { WsServer } from "./WsServer";
import { ZmqEventsHandlerProvider, type ZmqObjectProviderInterface } from "./ZmqEventsHandlerProvider";
import { RpcService } from "./RpcService";
import { RpcServiceConfig } from "./RpcServiceConfig";
import type { RouteConfig } from "./RestApiRoutesService";
import { WsClient } from "./WsClient";

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

export interface VerusdLocalConfig {
    daemon: DaemonConfig
    localServer: LocalServerConfig
}

export interface VerusdProxyConfig {
    url: string,
    apiToken?: string,
}

export interface VerusdWebConfig {
    config: VerusdLocalConfig | VerusdProxyConfig
}

export class VerusdWeb implements ServerInterface {
    private verusdWebServer: ServerInterface | ZmqObjectProviderInterface | undefined;
    private isLocalServer = false;

    get localServer(): VerusdWebLocalServer {
        if(!this.isLocalServer) {
            throw new Error("VerusdWeb is not configured as a local server instance.");
        }
        return this.verusdWebServer as VerusdWebLocalServer;
    }
    
    get proxyServer(): VerusdWebProxyServer {
        if(this.isLocalServer) {
            throw new Error("VerusdWeb is not configured as a proxy server instance.");
        }
        return this.verusdWebServer as VerusdWebProxyServer;
    }

    constructor(c: VerusdWebConfig) {
        this.isLocalServer = c.config.hasOwnProperty('daemon');
        if(this.isLocalServer) {
            this.verusdWebServer = new VerusdWebLocalServer(c.config as VerusdLocalConfig);
            return;
        }

        this.verusdWebServer = new VerusdWebProxyServer(c.config as VerusdProxyConfig);
    }

    open(): ServerInterface {
        (this.verusdWebServer as ServerInterface).open();
        return this;
    }

    close(): boolean {
        (this.verusdWebServer as ServerInterface).close();
        return true;
    }
}

class VerusdWebProxyServer implements ServerInterface {
    private wsClient: WsClient;
    constructor(config: VerusdProxyConfig) {
        this.wsClient = new WsClient(config.url);
    }

    open(): ServerInterface {
        this.wsClient.open();
        return this;
    }

    close(): boolean {
        this.wsClient?.close();
        return true;
    }
}
class VerusdWebLocalServer implements ServerInterface, ZmqObjectProviderInterface {
    private zmqClient: ZmqClient;
    private httpServer: HttpServer;
    private wsServer: WsServer;
    private daemonConfig: DaemonConfig;
    private localServerConfig: LocalServerConfig;
    private clientHooks: ClientMessageHookInterface[] = [];
    private customApiRoutes: RouteConfig[] = [];
    private zmqEventsProvider: ZmqEventsHandlerProvider;

    get zmq(): ZmqEventsHandlerProvider { return this.zmqEventsProvider; }

    constructor(config: VerusdLocalConfig) {
        this.daemonConfig = config.daemon;
        this.localServerConfig = config.localServer;
        this.wsServer = new WsServer();
        this.zmqEventsProvider = new ZmqEventsHandlerProvider(this.wsServer);

        const zmqEventsHandler = this.zmqEventsProvider.eventsHandler;

        this.zmqClient = new ZmqClient(
            this.daemonConfig.zmq.host,
            this.daemonConfig.zmq.port,
            this.wsServer,
            zmqEventsHandler
        );

        this.customApiRoutes = (config.localServer.customApiRoutes !== undefined)? config.localServer.customApiRoutes : [];
        this.clientHooks = (config.localServer.ws?.clientHooks !== undefined)? config.localServer.ws.clientHooks : []

        this.httpServer = new HttpServer({
            port: this.localServerConfig.port,
            wsServer: this.wsServer,
            clientHooks: this.clientHooks,
            customApiRoutes: this.customApiRoutes,
            apiToken: config.localServer.apiToken ?? ''
        });

        this.initDaemonRpcConnection(config?.localServer.excludedMethods ?? []);
    }

    open(): ServerInterface {
        this.httpServer?.open();
        this.zmqClient?.connect();
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