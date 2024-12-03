
![Logo](https://raw.githubusercontent.com/pangz-lab/verusd-web/main/icon.webp)
# Verusd-Web
A bi-directional Veurus node interface that enables receiving and accepting chain events for <b>Verus</b> and all <b>PBaaS</b> chains.

## Introduction
VerusdWeb can be configured to receive real-time blockchain events as well as sending RPC request to the Verus Blockchain.
This can be think of as Verus a proxy-server with a straigthforward integration and minimal setup.

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
npm install verusd-web
```

## Usage

### Importing the Library

```typescript
import { VerusdWeb } from 'verusd-web';
```

### Example
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

### Access from Client
<ul>
    <li>
        Using <b>Postman</b>, go to 
        <pre>ws://localhost:3333/verus/wss</pre>
    </li>
</ul>

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





