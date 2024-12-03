import { ServerInterface } from "./ServerInterface";
import { HttpServer, type ClientMessageHookInterface } from "./HttpServer";
import { ZmqClient } from "./ZmqClient";
import { WsServer } from "./WsServer";
import { ZmqEventsHandlerProvider } from "./ZmqEventsHandlerProvider";
import { RpcService } from "./RpcService";
import { RpcServiceConfig } from "./RpcServiceConfig";

interface ZmqServer {
    host: string,
    port: number
}

interface LocalServerOptions {
    port: number
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
    clientHooks?: ClientMessageHookInterface[]
    excludedMethods?: string[]
}

export class VerusdWeb implements ServerInterface {
    private zmqClient: ZmqClient;
    private httpServer: HttpServer;
    private wsServer: WsServer;
    private daemonConfig: DaemonConfig;
    private localServerOptions: LocalServerOptions;
    private clientHookInterface: ClientMessageHookInterface[] = [];
    private zmqEventsProvider: ZmqEventsHandlerProvider;

    get zmq(): ZmqEventsHandlerProvider {
        return this.zmqEventsProvider!;
    }

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

        if(config.clientHooks !== undefined) {
            this.clientHookInterface = config.clientHooks;
        }
        this.httpServer = new HttpServer(
            this.localServerOptions.port,
            this.wsServer,
            this.clientHookInterface
        );

        this.initDaemonRpcConnection(config?.excludedMethods ?? []);
    }

    private initDaemonRpcConnection(excludedMethods: string[]): void {
        let host = (this.daemonConfig.port === undefined) ?
            this.daemonConfig.host :
            `${this.daemonConfig.host}:${this.daemonConfig.port}`;

        RpcServiceConfig.set(excludedMethods);
        RpcService.init(host, 'Basic ' + btoa(`${this.daemonConfig.user}:${this.daemonConfig.password}`));
    }

    open(): ServerInterface {
        this.httpServer.open();
        this.zmqClient.connect();
        return this;
    }

    close(): boolean {
        this.zmqClient.disconnect();
        this.httpServer.close();
        return true;
    }
}