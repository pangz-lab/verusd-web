import {
    EventData,
    SubscriptionEventsHandler,
    SubscriptionTopics,
    VerusZmqClient,
    VerusZmqConnection,
    VerusZmqOptions
} from "verus-zmq-client";
import { WsServer } from "./WsServer";

export class ZmqClient {
    private client?: VerusZmqClient;
    private wsServer: WsServer;
    private host: string;
    private port: number;
    private eventHandler: SubscriptionEventsHandler;

    constructor(
        host: string,
        port: number,
        wsServer: WsServer,
        eventHandler?: SubscriptionEventsHandler,
    ) {
        this.host = host;
        this.port = port;
        this.wsServer = wsServer;
        this.eventHandler = (eventHandler == null)? 
            this.getDefaultEventHandler() :
            eventHandler
    }

    connect(): void {
        try {
            this.client = new VerusZmqClient(
                new VerusZmqOptions(
                    new VerusZmqConnection(this.host, this.port),
                    [
                        SubscriptionTopics.hashBlock,
                        SubscriptionTopics.hashTx,
                        SubscriptionTopics.rawBlock,
                        SubscriptionTopics.rawTx,
                    ],
                    this.eventHandler
                )
            );

            this.client!
                .connect()
                .listen();
            console.log("ZMQ Client connected to " + this.host + ':' + this.port);
        } catch (e) {
            throw new Error("An error occurred while initializing the ZMQ Client.");
        }
    }

    disconnect(): void {
        this.client!.disconnect();
    }

    private getDefaultEventHandler(): SubscriptionEventsHandler {
        const wss = this.wsServer;        
        return {
            onHashBlockReceived: async function (value: EventData): Promise<Object> {
                console.log("📢 onHashBlockReceived >>" + value);
                if(value != undefined) { wss.send(value); }
                return {};
            }
        };
    }
}