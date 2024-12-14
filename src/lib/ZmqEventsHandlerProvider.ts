import type { EventData, SubscriptionEventsHandler } from "verus-zmq-client";
import { WsServer } from "./WsServer";

type CustomReceivedEventCallback = (value: EventData, topic?: string, result?: Object, wsServer?: WsServer) => Object;

class CustomEventsManager {
    private static events: CustomReceivedEventCallback[] = [];
    private static wsServer?: WsServer;
    static wsSet(wsServer: WsServer): void {
        CustomEventsManager.wsServer = wsServer;
    }
    
    static wsGet(): WsServer | undefined {
        return CustomEventsManager.wsServer;
    }

    static init(): void {
        CustomEventsManager.events = [];
        CustomEventsManager.wsServer = undefined;
    }

    static set(index: number, cb: CustomReceivedEventCallback): void {
        CustomEventsManager.events[index] = cb;
    }
    
    static get(index: number): CustomReceivedEventCallback | undefined {
        return CustomEventsManager.events[index];
    }
}

export class ZmqEventsHandlerProvider {
    private events: CustomReceivedEventCallback[] = [];
    constructor(private wsServer?: WsServer) {
        CustomEventsManager.init();
        if(this.wsServer !== undefined) { CustomEventsManager.wsSet(this.wsServer); }
    }

    get e(): CustomReceivedEventCallback[] {
        return this.events;
    }

    onHashBlock(f: CustomReceivedEventCallback): CustomReceivedEventCallback {
        CustomEventsManager.set(0, f);
        return f;
    }
    
    onHashTx(f: CustomReceivedEventCallback): CustomReceivedEventCallback {
        CustomEventsManager.set(1, f);
        return f;
    }
    
    onRawBlock(f: CustomReceivedEventCallback): CustomReceivedEventCallback {
        CustomEventsManager.set(2, f);
        return f;
    }
    
    onRawTx(f: CustomReceivedEventCallback): CustomReceivedEventCallback {
        CustomEventsManager.set(3, f);
        return f;
    }

    get eventsHandler(): SubscriptionEventsHandler {
        return {
            onHashBlockReceived: function (value: EventData, topic?: string, result?: Object): Object {
                if(CustomEventsManager.get(0) != undefined) {
                    CustomEventsManager.get(0)!(value, topic, result, CustomEventsManager.wsGet());
                }
                return {};
            },
            onHashTxReceived: function (value: EventData, topic?: string, result?: Object): Object {
                if(CustomEventsManager.get(1) != undefined) {
                    CustomEventsManager.get(1)!(value, topic, result, CustomEventsManager.wsGet());
                }
                return {};
            },
            onRawBlockReceived: function (value: EventData, topic?: string, result?: Object): Object {
                if(CustomEventsManager.get(2) != undefined) {
                    CustomEventsManager.get(2)!(value, topic, result, CustomEventsManager.wsGet());
                }
                return {};
            },
            onRawTxReceived: function (value: EventData, topic?: string, result?: Object): Object {
                if(CustomEventsManager.get(3) != undefined) {
                    CustomEventsManager.get(3)!(value, topic, result, CustomEventsManager.wsGet());
                }
                return {};
            },
        };
    }
}