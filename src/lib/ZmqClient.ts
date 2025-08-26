import {
    SubscriptionEventsHandler,
    SubscriptionTopics,
    VerusZmqClient,
    VerusZmqConnection,
    VerusZmqOptions
} from "verus-zmq-client";

export class ZmqClient {
    private client?: VerusZmqClient;
    private host: string;
    private port: number;
    private eventHandler: SubscriptionEventsHandler;

    constructor(
        host: string,
        port: number,
        eventHandler: SubscriptionEventsHandler,
    ) {
        this.host = host;
        this.port = port;
        this.eventHandler = eventHandler
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
        if(this.client != undefined) { this.client.disconnect(); }
    }
}