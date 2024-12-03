// import type { EventData } from "verus-zmq-client";
import type { EventData } from "verus-zmq-client";
import { VerusdWeb } from "../src/lib/VerusdWeb";
import { WsServer } from "../src/lib/WsServer";
import { RpcService } from "../src";

// import { WsServer } from "./lib/WsServer";
// import { RpcService } from "./lib/RpcService";
// import type { ClientMessageHookInterface } from "./lib/HttpServer";
// import { RpcService } from "./lib/RpcService";


// class CustomClientHook implements ClientMessageHookInterface {
//     messageReceived(_client: WebSocket, _rawMessage: string): Object {
//         // throw new Error('Method not implemented.');
//         console.log("messageReceived >>");
//         return {res: 1, m: 'messageReceived'};
//     }
//     // beforeRpcRequest(_client: WebSocket, _rawMessage: string): Object {
//     //     // throw new Error('Method not implemented.');
//     //     console.log("beforeRpcRequest >>");
//     //     return {res: 1, m: 'beforeRpcRequest'};
//     // }
//     // afterRpcRequest(_client: WebSocket, _rawMessage: string, _rpcResult: string): Object {
//     //     // throw new Error('Method not implemented.');
//     //     console.log("afterRpcRequest >>");
//     //     console.log(_rpcResult);
//     //     return {res: 1, m: 'afterRpcRequest'};
//     //     // return {};
//     // }
//     // afterClientSend(_client: WebSocket, _rawMessage: string, _rpcResult: string): Object {
//     //     // throw new Error('Method not implemented.');
//     //     console.log("afterClientSend >>");
//     //     console.log(_rpcResult);
//     //     return {res: 1, m: 'afterClientSend'};
//     //     // return {};
//     // }
// }

// class CustomClientHook2 implements ClientMessageHookInterface {
//     messageReceived(_client: WebSocket, _rawMessage: string): Object {
//         // throw new Error('Method not implemented.');
//         console.log("22messageReceived >>");
//         const d = JSON.parse(_rawMessage);
//         RpcService.sendChainRequest(d.m, d.p)
//         .then((v) => {
//             _client.send(JSON.stringify(v));
//         });
//         return {res: 2, m: '22messageReceived'};
//     }
//     // beforeRpcRequest(_client: WebSocket, _rawMessage: string): Object {
//     //     // throw new Error('Method not implemented.');
//     //     console.log("22beforeRpcRequest >>");
//     //     return {res: 2, m: '22beforeRpcRequest'};
//     //     // return {};
//     // }
//     // afterRpcRequest(_client: WebSocket, _rawMessage: string, _rpcResult: string): Object {
//     //     // throw new Error('Method not implemented.');
//     //     console.log("22afterRpcRequest >>");
//     //     console.log(_rpcResult);
//     //     return {res: 2, m: '22afterRpcRequest'};
//     //     // return {};
//     // }
//     // afterClientSend(_client: WebSocket, _rawMessage: string, _rpcResult: string): Object {
//     //     // throw new Error('Method not implemented.');
//     //     console.log("22afterClientSend >>");
//     //     console.log(_rpcResult);
//     //     return {res: 2, m: '22afterClientSend'};
//     //     return {};
//     // }
// }

const proxy = new VerusdWeb({
    daemonConfig: {
        host: 'localhost',
        port: 27486,
        user: 'verusdesktop',
        password: 'y8D6YXhAFk6jShHiRBKAgRCx0t9ZdMf2S3K0o7zN8So',
        zmq: { host: 'localhost', port: 8900 }
    },
    localServerOptions: { port: 3333 },
    excludedMethods: ['getblock']
    // [ new CustomClientHook(), new CustomClientHook2() ]
});


proxy.zmq.onHashBlock(async (value: EventData, _topic?: string, _result?: Object, wsServer?: WsServer): Promise<Object> => {
    console.log("[ value this is meeee custom ] >>>");
    console.log(value);
    wsServer?.send(value);
    // const v = await HttpService.sendChainRpcRequest('getblockchaininfo', []);
    const v = await RpcService.sendChainRequest('getblock', [value]);
    console.log(v);
    // console.log(JSON.parse(v as any));
    // console.log(JSON.stringify(v));
    wsServer?.send(v);
    return value;
});

// proxy.zmq.onHashTx(async (value: EventData, _topic?: string, _result?: Object, wsServer?: WsServer): Promise<Object> => {
//     console.log("[ value this is meeee custom ] >>>");
//     console.log(value);
//     wsServer?.send(value);
//     // const v = await HttpService.sendChainRpcRequest('getblockchaininfo', []);
//     const tx = await RpcService.sendChainRequest('getrawtransaction', [value]);
//     const v = await RpcService.sendChainRequest('decoderawtransaction', [tx.result]);
//     console.log(v);
//     // console.log(JSON.parse(v as any));
//     // console.log(JSON.stringify(v));
//     wsServer?.send(v);
//     return value;
// });


proxy.open();