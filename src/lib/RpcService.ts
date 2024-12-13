export interface RpcResult {
    result: any,
    error: any,
    id: string
}

export class RpcService {
    private static readonly code = 'HttpService';
    private static url = 'localhost'
    private static apiToken = 'authToken'
    private static maxRetry = 5;

    static init(url: string, apiToken?: string, maxRetry?: number): void {
        RpcService.url = RpcService.setProtocol(url);
        RpcService.maxRetry = maxRetry ?? 5;
        RpcService.apiToken = apiToken ?? '';
    }

    static async sendChainRequest(method: string, params: Object): Promise<RpcResult> {
        const payload = {"jsonrpc": "1.0", "id":"verusdWeb", "method": method, "params": params}
        try {
            const response = await RpcService.sendRequest(
                this.url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': RpcService.apiToken
                    },
                    body: JSON.stringify(payload),
                },
                RpcService.maxRetry
            );
            // status = response.status;
            // console.log(
            //     '⛓️‍💥 ' 
            //     + (status != 200 ? '❗️ ' : '✅ ')
            //     + "Chain RPC Request :" 
            //     + method 
            //     + ' / params: ' 
            //     + JSON.stringify(params) 
            //     + ' / result : ' 
            //     + status
            // );
            return JSON.parse(await RpcService.processStreamResponse(response.body));

        } catch (e) {
            console.log("❗️Failed to send the RPC request!")
            throw e;
        }
    }

    private static setProtocol(host: string): string {
        const h = host.trim();
        if(h.startsWith('http://') || h.startsWith('https://')) {
            return h;
        }

        return `http://${host}`;
    }

    private static async sendRequest(
        url: string,
        options: RequestInit = {},
        retries: number = 3,
        delayInMs: number = 1000
    ): Promise<Response> {

        return new Promise((resolve, reject) => {
            const attemptFetch = (attempt: number) => {
                fetch(url, options)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(
                                `HTTP error!` +
                                `\nStatus: ${response.status}` +
                                `\nResponse: ${JSON.stringify(response)}`
                            );
                        }
                        resolve(response);
                    })
                    .catch((error) => {
                        if (attempt < retries) {
                            console.log(`Retry attempt ${attempt + 1} failed. Retrying request to ${url}...`);
                            setTimeout(() => attemptFetch(attempt + 1), delayInMs);
                        } else {
                            reject(error);
                        }
                    });
            };

            attemptFetch(0);
        });
    }

    static async processStreamResponse(stream: any): Promise<string> {
        const reader = stream.getReader();
        const chunks: Uint8Array[] = [];

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) { break; }
                if (value) { chunks.push(value); }
            }
            
            const combined = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            var offset = 0;
            for (const chunk of chunks) {
                combined.set(chunk, offset);
                offset += chunk.length;
            }
            const text = new TextDecoder().decode(combined);

            return text;
        } catch (error) {
            console.error(
                RpcService.code,
                'Error processing the stream.',
                (error as Error).toString(),
                'Check the service and try again.'
            );
            throw error;
        } finally {
            reader.releaseLock();
        }
    }
}