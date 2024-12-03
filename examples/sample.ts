// import type { EventData } from "verus-zmq-client";
import type { EventData } from "verus-zmq-client";
import { VerusdWeb } from "../src/lib/VerusdWeb";
import { WsServer } from "../src/lib/WsServer";
import { RpcService, type ClientMessageHookInterface } from "../src";

class CustomClientHook implements ClientMessageHookInterface {
    messageReceived(_client: WebSocket, _rawMessage: string): Object {
        console.log("messageReceived >>");
        return {res: 1, m: 'messageReceived'};
    }
}

class CustomClientHook2 implements ClientMessageHookInterface {
    messageReceived(_client: WebSocket, _rawMessage: string): Object {
        console.log("22messageReceived >>");
        const d = JSON.parse(_rawMessage);
        RpcService.sendChainRequest(d.m, d.p)
        .then((v) => {
            _client.send(JSON.stringify(v));
        });
        return {res: 2, m: '22messageReceived'};
    }
}

const proxy = new VerusdWeb({
    daemonConfig: {
        host: 'localhost',
        port: 27486,
        user: 'user',
        password: 'password',
        zmq: { host: 'localhost', port: 8900 }
    },
    localServerOptions: {
        port: 3333,
        excludedMethods: ['getblock'],
        ws: {
            clientHooks: [ new CustomClientHook(), new CustomClientHook2() ]
        }
    },
});

proxy.zmq.onHashBlock(async (value: EventData, _topic?: string, _result?: Object, wsServer?: WsServer): Promise<Object> => {
    console.log("[ onHashBlock ] >>>");
    console.log(value);
    const v = await RpcService.sendChainRequest('getblock', [value]);
    wsServer?.send(v);
    return value;
});

proxy.zmq.onHashTx(async (value: EventData, _topic?: string, _result?: Object, wsServer?: WsServer): Promise<Object> => {
    console.log("[ onHashTx ] >>>");
    const tx = await RpcService.sendChainRequest('getrawtransaction', [value]);
    const v = await RpcService.sendChainRequest('decoderawtransaction', [tx.result]);
    wsServer?.send(v);
    return value;
});


try {
    proxy.open();
} catch(e) {
    console.error('Failed to open the connection');
    proxy.close();
}