import { Express, Request, Response, NextFunction } from 'express';

type RouteController = (req: Request, res: Response) => void;
export interface RouteConfig {
    method: string,
    apiVersion: number,
    route: string,
    controller: RouteController
}

export class RestApiRoutesService {
    private static apiToken = '';
    private static readonly allowedMethods = [ "get", "post", "put", "patch", "delete" ];
    static generate(app: Express, routeConfigs: RouteConfig[] = [], apiToken?: string): void {
        // Logger.toDebugLog("🚏 Creating middlware ...").write();
        if(routeConfigs[0] === undefined) { return; }
        
        console.log("🚏 Creating API routes ...");
        routeConfigs.forEach((routeConfig: RouteConfig) => {
            RestApiRoutesService.setRoute(app, routeConfig);
        });
        RestApiRoutesService.addMiddleware(app, apiToken ?? '');
    }

    private static setRoute(app: Express, config: RouteConfig): void {
        const method = config.method.trim().toLowerCase();

        if(!RestApiRoutesService.allowedMethods.includes(method)) { return; }
        const version = 'v' + config.apiVersion.toString();
        const route = `/api/${version}/${config.route}`;
        console.log(` >>> route ... ${method} -> ${route}`);

        switch(method) {
            case "get": app.get(route, config.controller); return;
            case "post": app.post(route, config.controller); return;
            case "delete": app.delete(route, config.controller); return;
            case "put": app.put(route, config.controller); return;
            case "patch": app.patch(route, config.controller); return;
        }

        throw new Error(`Route configuration is invalid - ${config.route}`)
    }

    private static checkToken(req: Request, res: Response, next: NextFunction) {
        const apiKey = req.header('x-api-key');
        if (apiKey && apiKey === RestApiRoutesService.apiToken) {
            next();
        } else {
            res.status(401).json({ message: 'Access restricted' });
        }
    }

    private static addMiddleware(app: Express, apiToken: string) {
        if(apiToken.trim() !== '') {
            RestApiRoutesService.apiToken = apiToken
            app.use(RestApiRoutesService.checkToken);
        };
    }
}