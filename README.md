
![Logo](https://raw.githubusercontent.com/pangz-lab/verusd-web/main/icon.webp)
# Verusd-Web
A bi-directional Veurus node interface that enables receiving chain events and accepting request from and to <b>Verus</b> chain. 
This fully supports all <b>PBaaS</b> chains.

## Introduction
VerusdWeb can be configured to receive real-time blockchain events as well as sending RPC request to the Verus Blockchain.
This works as a proxy-server with a straigthforward integration and minimal setup to the chain so you can use it in no time.

Just setup the node and run. By default, you can access all publicly-safe rpc methods.

## Use-cases
#### Proxy Verus Node API for Bi-directional, Real-Time Communication:
> You're aiming to create a proxy layer over the Verus Node API that supports real-time, event-driven communication, using WebSocket for push notifications and updates from the blockchain.

#### Custom Scripts on Blockchain Events:
> The system would allow for scripts to be triggered based on specific blockchain events, offering automation or immediate action based on blockchain state changes.

#### Support for Verus REST API Methods:
> Out-of-the-box support for common Verus RPC methods, allowing users to interact with these methods via both HTTP and WebSocket.

#### Custom REST API Endpoints:
> Users can define their own API endpoints to extend functionality beyond what's provided by default Verus APIs, potentially using a utility class for ease of integration with existing RPC methods.

#### Custom API(Like Caching and Calculations):
> Creating a custom API that can cache blockchain data for performance or perform additional calculations based on blockchain data like liquidity metrics.

# Setup
## Verus Coin Setup
Enable the ZMQ setting first by adding the following lines in the `VRSC.conf`.
> 📑 ***Note*** <br>
> You should have a Verus node running locally. <br>The address `127.0.0.1:8900` will serve as the ZMQ web server to be accessed by this library.
> You can change it to any available ports.
>


| OS    |  Directory |
|:-----:|:--------|
| [![Linux](https://skillicons.dev/icons?i=linux)](https://skillicons.dev)  | `~/.komodo/VRSC` |
| [![Mac](https://skillicons.dev/icons?i=apple)](https://skillicons.dev)    | `/Users//Library/Application Support/komodo/VRSC` |
| [![Windowa](https://skillicons.dev/icons?i=windows)](https://skillicons.dev) | `%AppData%\Komodo\VRSC\` |

### Steps
This is applicable for `Verus` and `PBaaS` blockchains.
1. Update the configuration file (see below).
2. Restart the node.

#### ZMQ Configuration
Copy and paste to the config file.
```bash
...
zmqpubrawblock=tcp://127.0.0.1:8900
zmqpubrawtx=tcp://127.0.0.1:8900
zmqpubhashtx=tcp://127.0.0.1:8900
zmqpubhashblock=tcp://127.0.0.1:8900
```

### ⛓ PBaaS Chain Ready
> 
> PBaaS is already supported by this library.
> To enable, just follow the same setup procedure.
> <br>Ideally, the port should be different from the Verus node ZMQ configuration.
> 
> Take note that PBaaS chain configurations (`*.conf` file) are located in a directory different from Verus.
> <br>For example, in `Linux`, can be found in `~/.verus/pbaas/<pabaas_chain_id>/<pabaas_chain_id>.conf`
> 

🔖[see for more details](https://wiki.verus.io/#!how-to/how-to_verus_info.md)

## Installation

To install, you can use npm:

```bash
npm i verusd-web
```

## Usage

### Importing the Library

```typescript
import { VerusdWeb } from 'verusd-web';
```

## Samples
### 1. Basic Setup
- Run the `websocket` and `http` server at the same time.
- Call the supported RPC methods.
```typescript
const vdWeb = new VerusdWeb({
    daemonConfig: {
        host: 'localhost',
        port: 27486,
        user: 'user',
        password: 'password',
        zmq: { host: 'localhost', port: 8900 }
    },
    localServerOptions: { port: 3333 },
});


try {
    vdWeb.open();
} catch(e) {
    console.error('Failed to open the connection');
    vdWeb.close();
}
```

### Check the Result
- To test using <b><a href="https://www.postman.com">Postman</a></b>, access the following url.
This enables you to receive real-time chain events.
<br><b>endpoint</b> : `ws://localhost:3333/verusd/web`
  
- To do an RPC call to the node using `websocket`, use the following.
From the client, you can send a message in the following format.
<pre>{"m": "getblock", "p": ["c084c79d1e6097d4b5e7db87c3057337f05bad85ef757446a6461402993c579c"]}</pre>

- To do an RPC call to the node using `http`, use the following.
From the client, you can send a message in the following format.
<br><b>endpoint</b> : `http://localhost:3333/api/v1/verusd/web`
<pre>{"m": "getblock", "p": ["c084c79d1e6097d4b5e7db87c3057337f05bad85ef757446a6461402993c579c"]}</pre>

<hr/>

### 2. Create Custom API Routes(New Endpoints)
- Create custom routes as many as you need.
- Use `RpcService.sendChainRequest` to send an RPC request the chain. It's a built-in utilitu.
- Routing feature uses `express` under the hood.
```typescript

function txController(req: Request, res: Response) {
    const tx = req.params.tx;
    RpcService
        .sendChainRequest('getrawtransaction', [ tx ])
        .then((v) => { res.send(v) });
}

function blockController(req: Request, res: Response) {
    const block = req.params.block;
    RpcService
        .sendChainRequest('getblock', [ block ])
        .then((v) => { res.send(v) });
}

const vdWeb = new VerusdWeb({
    daemonConfig: {
        host: 'localhost',
        port: 27486,
        user: 'user',
        password: 'password',
        zmq: { host: 'localhost', port: 8900 }
    },
    localServerOptions: {
        port: 3333,
        customApiRoutes: [
            { method: 'get', apiVersion: 1, route: 'tx/:tx', controller: txController },
            { method: 'get', apiVersion: 1, route: 'block/:block', controller: blockController }
        ],
    },
});
```

### Check the Result
- Try to access using the browser.
- Handled by `txController`
<pre>http://localhost:3333/api/v1/tx/91048ebae23b94f7542170bef4055bcf9d37c5b1206ca5db746e4a207174ab45</pre>

- Handled by `blockController`
<pre>http://localhost:3333/api/v1/block/1233353</pre>

<hr/>

### 3. Listen to Blockchain Events
- Listen when a new block or transaction is created.
- Run a custom script when an event occur.
- Customize the data returned to the clients.
```typescript

const vdWeb = new VerusdWeb({
    daemonConfig: {
        host: 'localhost',
        port: 27486,
        user: 'user',
        password: 'password',
        zmq: { host: 'localhost', port: 8900 }
    },
    localServerOptions: {
        port: 3333,
    },
});

vdWeb.zmq.onHashBlock(async (value: EventData, _topic?: string, _result?: Object, wsServer?: WsServer): Promise<Object> => {
    console.log("[ On New Block ]");
    const v = await RpcService.sendChainRequest('getblock', [value]);
    wsServer?.send(v);
    return value;
});


vdWeb.zmq.onHashTx(async (value: EventData, _topic?: string, _result?: Object, wsServer?: WsServer): Promise<Object> => {
    console.log("[ On New Tx ]");
    wsServer?.send(value);
    const tx = await RpcService.sendChainRequest('getrawtransaction', [value]);
    const v = await RpcService.sendChainRequest('decoderawtransaction', [tx.result]);
    wsServer?.send(v);
    return value;
});

```

### Check the Result
- Check using any `ws` client
<br><b>endpoint</b> : `ws://localhost:3333/verusd/web`
- Check from your console to see when an event is emitted.
- `wsServer?.send(v)` is run to make sure the result is returned to the `websocket` client;
- With these, data can be customized as needed.


### [ Check the Samples ]
<video controls width="1200">
  <source src="https://raw.githubusercontent.com/pangz-lab/verusd-web/main/samples.webm" type="video/webm" />
  <p>
    Your browser doesn't support HTML video. Here is a
    <a href="https://raw.githubusercontent.com/pangz-lab/verusd-web/main/samples.webm" download="https://raw.githubusercontent.com/pangz-lab/verusd-web/main/samples.webm">link to the video</a> instead.
  </p>
</video>

<hr>

# Support
For any issues or inquiries, you can raise a PR or contact me at
| Contacts    |  - |
|:-----:|:--------|
| [![Discord](https://skillicons.dev/icons?i=discord)](discordapp.com/585287860513669135) | `Pangz#4102` |
| [![Gmail](https://skillicons.dev/icons?i=gmail)](pangz.lab@gmail.com) |`pangz.lab@gmail.com` |
| [![X](https://skillicons.dev/icons?i=twitter)](https://x.com/PangzLab) |`@PangzLab` |



# Reference
- ***Verus*** : https://verus.io/
- ***Verus Wiki*** : https://wiki.verus.io/#!index.md
- ***Bitcoin ZMQ*** :  https://github.com/bitcoin/bitcoin/blob/master/doc/zmq.md

# License
This library is released under the [MIT License](https://github.com/pangz-lab/verusd-web/blob/main/LICENSE).

# Support Us
Creating and maintaining a high-quality library is a labor of love that takes countless hours of coding, debugging, and community interaction. If this library has made your development easier, saved you time, or added value to your projects, consider supporting its ongoing growth and maintenance. Your contributions directly help keep this project alive, up-to-date, and evolving.

Every donation, no matter the size, goes a long way in motivating the developer to dedicate time and energy to improving the library. With your support, We can continue fixing bugs, adding new features, and providing documentation and support for the community. By donating, you’re not just saying “thank you” for the work done so far—you’re investing in the library's future and helping it remain a reliable tool for developers worldwide.

Let’s make this library even better, together! Consider donating to show your appreciation and ensure the continued development of this project. Your generosity fuels innovation and sustains the open-source ecosystem we all benefit from. Thank you for your support! 🍻

### Donation Address
***Verus ID*** : 
pangz@
<br>
***VRSC*** : 
RNrhRTq8ioDTrANrm52c9MfFyPKr3cmhBj

***vARRR*** : 
RWCNjDd2HNRbJMdsYxN8ZDqyrS9fYNANaR

***vDEX*** : 
RWCNjDd2HNRbJMdsYxN8ZDqyrS9fYNANaR

***KMD*** : 
RWCNjDd2HNRbJMdsYxN8ZDqyrS9fYNANaR

***BTC*** : 
3MsmELpB8bsYvFJCYKrUpMuoBATVR5eeta

***ETH*** : 
0xa248d188725c3b78af7e7e8cf4cfb8469e46cf3b





