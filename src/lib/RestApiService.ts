import { Request, Response } from 'express';
import { RpcService } from "./RpcService";
import { RpcServiceConfig } from './RpcServiceConfig';

export class RestApiService {
    static async routeController(req: Request, res: Response) {
        const body = req.body;
        try {
            const v = await RpcService.sendChainRequest(body.m, body.p)
            const allowed = RpcServiceConfig.getAllowedMethods().includes(body.m);
            if(allowed) {
                res.send(v);
                return;
            }
            res.send({result: 'unknown rest api method', error: true});
        } catch(e) {
            res.send({result: 'unknown error occurred', error: true});
        }
    }
}