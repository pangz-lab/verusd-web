import WebSocket, { WebSocketServer } from 'ws';
import { DuplexServerInterface, ServerInterface } from './ServerInterface';

type EventsConfig = {
    intervalCheckInSec?: number,
};

export class WsServer 
    implements DuplexServerInterface, ServerInterface  {
    private wss?: WebSocketServer;
    private config?: WebSocket.ServerOptions;
    private connectionCheckerInterval?: NodeJS.Timeout;
    private defaultEventsConfig: EventsConfig = {
        intervalCheckInSec: 30000
    }

    constructor(config: WebSocket.ServerOptions = {
        noServer: true,
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
        }
    }) {
        this.config = config;
    }

    get socket(): WebSocketServer | undefined { return this.wss; }

    open(): WsServer {
        this.wss = new WebSocketServer(this.config);
        console.log("WS Server started ...");
        return this;
    }

    close(): boolean {
        try {
            this.wss!.clients.forEach(function each(client) { client.close();});
            this.wss!.close();
            return true;
        } catch (e) {
            return false;
        }
    }

    receive(): void {
        if(this.wss === undefined) { throw new Error('WebSocket Server is not running.'); };

        const wss = this.wss!;
        const connectionCheckerInterval = this.connectionCheckerInterval;

        wss.on('close', function() {
            if(connectionCheckerInterval != null) { clearInterval(connectionCheckerInterval); }
        });

        this.connectionCheckerInterval = setInterval(function() {
            wss.clients.forEach(function each(ws) {
                if (ws.readyState !== WebSocket.OPEN) { return ws.terminate(); }
            });
        }, this.defaultEventsConfig.intervalCheckInSec);
    }

    send(payload: any) {
        if(this.wss === undefined) { throw new Error('WebSocket Server is not running.'); };

        var clientsCount = 0;
        var dcClientsCount = 0;

        this.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                clientsCount += 1;
                client.send(JSON.stringify(payload));
            } else {
                dcClientsCount += 1;
                client.close();
            }
        });
    }
}