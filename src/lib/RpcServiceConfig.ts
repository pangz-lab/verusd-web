export class RpcServiceConfig {
    private static readonly defaultAllowedMethods = [
        'getaddressbalance',
        'getaddressdeltas',
        'getaddressmempool',
        'getaddresstxids',
        'getaddressutxos',
        'getsnapshot',
        'getsnapshot',
        'coinsupply',
        'getbestblockhash',
        'getblock',
        'getblockchaininfo',
        'getblockcount',
        'getblockdeltas',
        'getblockhash',
        'getblockhashes',
        'getblockheader',
        'getchaintips',
        'getchaintxstats',
        'getdifficulty',
        'getmempoolinfo',
        'getrawmempool',
        'getspentinfo',
        'gettxout',
        'gettxoutproof',
        'gettxoutsetinfo',
        'kvsearch',
        'kvupdate',
        'verifychain',
        'verifytxoutproof',
        'z_gettreestate',
        'getinfo',
        'z_getpaymentdisclosure',
        'z_validatepaymentdisclosure',
        'getidentitieswithaddress',
        'getidentitieswithrecovery',
        'getidentitieswithrevocation',
        'getidentity',
        'getidentitycontent',
        'getidentityhistory',
        'getidentitytrust',
        'listidentities',
        'recoveridentity',
        'registeridentity',
        'registernamecommitment',
        'revokeidentity',
        'signdata',
        'signmessage',
        'verifyhash',
        'verifymessage',
        'Verifysignature',
        'getoffers',
        'listopenoffers',
        'getblocksubsidy',
        'getblocktemplate',
        'getlocalsolps',
        'getnetworkhashps',
        'estimateconversion',
        'getbestproofroot',
        'getcurrency',
        'getcurrencyconverters',
        'getcurrencystate',
        'getcurrencytrust',
        'getexports',
        'getimports',
        'getinitialcurrencystate',
        'getlastimportfrom',
        'getlaunchinfo',
        'getnotarizationdata',
        'getnotarizationproofs',
        'getpendingtransfers',
        'getreservedeposits',
        'getsaplingtree',
        'listcurrencies',
        'getconnectioncount',
        'getdeprecationinfo',
        'getnettotals',
        'getnetworkinfo',
        'getpeerinfo',
        'listbanned',
        'ping',
        'decoderawtransaction',
        'decodescript',
        'getrawtransaction',
        'signrawtransaction',
        'createmultisig',
        'estimatefee',
        'estimatepriority',
        'validateaddress',
        'z_validateaddress',
        'getvdxfid',
    ];

    static set(excludedMethods: string[] = []): void {
        RpcServiceConfig.reduceMethods(excludedMethods);
    }

    static getAllowedMethods(): string[] {
        return RpcServiceConfig.defaultAllowedMethods
    }

    private static reduceMethods(excludedMethods: string[]): void {
        if(excludedMethods[0] === undefined) { return; }

        const m = RpcServiceConfig.defaultAllowedMethods;
        m.forEach((method: string, index: number) => {
            if(excludedMethods.includes(method)) {
                RpcServiceConfig.defaultAllowedMethods.splice(index, 1);
            }
        });
    }
}