import WebSocket from "ws";
import type { DuplexServerInterface, ServerInterface } from "./ServerInterface";

export class WsClient implements DuplexServerInterface, ServerInterface {
    private client: WebSocket | undefined;
    private url: string = '';
    constructor(url: string) {
        this.url = url;
    }

    open(): ServerInterface {
        this.client = new WebSocket(
            this.url,
            {
                headers: { 'User-Agent': 'Verusd-Web' },
                perMessageDeflate: {
                    zlibDeflateOptions: {
                        // See zlib defaults.
                        chunkSize: 1024,
                        memLevel: 7,
                        level: 3
                    },
                    zlibInflateOptions: {
                        chunkSize: 10 * 1024
                    },
                    // Other options settable:
                    clientNoContextTakeover: true, // Defaults to negotiated value.
                    serverNoContextTakeover: true, // Defaults to negotiated value.
                    serverMaxWindowBits: 10, // Defaults to negotiated value.
                    // Below options specified as default values.
                    concurrencyLimit: 10, // Limits zlib concurrency for perf.
                    threshold: 1024 // Size (in bytes) below which messages
                    // should not be compressed if context takeover is disabled.
                },
                maxPayload: 2 * 1024 * 1024//2MB
            }
        );
        this.receive();
        return this;
    }

    close(): boolean {
        if (this.client && this.client.readyState === WebSocket.OPEN) {
            this.client.close();
            return true;
        }
        return false;
    }

    receive(): void {
        this.client?.on('message', (data: WebSocket.Data) => {
            console.log("Message received:", data.toString());
        });
        
        
        this.client?.on('open', () => {
            console.log("Connection established.");
        });
        
        this.client?.on('close', () => {
            console.log("Connection closed.");
        });
        
        this.client?.on('error', () => {
            console.log("Connection error!");
        });
    }

    send<T>(data: T): void {
        this.client?.send(JSON.stringify(data));
    }
}