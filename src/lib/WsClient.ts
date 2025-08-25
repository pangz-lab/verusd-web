import WebSocket from "ws";
import type { DuplexServerInterface, ServerInterface } from "./ServerInterface";

export class WsClient implements DuplexServerInterface, ServerInterface {
    // Placeholder for future WebSocket client implementation
    private client: WebSocket | undefined;
    private url: string = '';
    constructor(url: string) {
        this.url = url;
    }

    open(): ServerInterface {
        this.client = new WebSocket(this.url);
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