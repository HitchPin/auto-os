import { APIGatewayProxyResult } from 'aws-lambda';
import * as apis from './apis';
import type { PartialProxyEvent } from './apis/Handler';
import { AdmiralError } from './AdmiralError';
import { HandlerMap } from './HandlerMap';

interface HandlerProps {
    CreateTenant?: apis.CreateTenantHandler,
    GetTenant?: apis.GetTenantHandler,
    DeleteTenant?: apis.DeleteTenantHandler,
    ListTenants?: apis.ListTenantsHandler,

    CreateProject?: apis.CreateProjectHandler,
    GetProject?: apis.GetProjectHandler,
    ListProjects?: apis.ListProjectsHandler,
}
export class Handler {

    #handlers: HandlerMap;

    constructor(props: HandlerProps) {
        const m = new HandlerMap();
        if (props.CreateTenant) m.addHandler(props.CreateTenant);
        if (props.GetTenant) m.addHandler(props.GetTenant);
        if (props.DeleteTenant) m.addHandler(props.DeleteTenant);
        if (props.ListTenants) m.addHandler(props.ListTenants);
        if (props.CreateProject) m.addHandler(props.CreateProject);
        if (props.GetProject) m.addHandler(props.GetProject);
        if (props.ListProjects) m.addHandler(props.ListProjects);
        this.#handlers = m;
    }

    handle = async (r: PartialProxyEvent): Promise<APIGatewayProxyResult> => {

        const h = this.#handlers.getHandler(r);
        if (h === undefined) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    name: 'OperationNotFound',
                    message: 'No matching operation found.'
                }),
                isBase64Encoded: false,
                headers: {
                    'Content-Type': 'application/json',
                    'X-ErrorType': 'OperationNotFound'
                }
            }
        }
        return await this.#handleWithHandler(h, r);
    }

    #handleWithHandler = async (handler: apis.Handler<any, any>, r: PartialProxyEvent): Promise<APIGatewayProxyResult> => {
        try {
            const pathParamMatches = r.path.match(handler.path);
            const pathParams = new Map<string, string>(Object.entries(pathParamMatches!.groups! ?? {}));
            const req = handler.deserialize(r, pathParams);
            const res = await handler.handle(req);
            return {
                statusCode: 200,
                body: JSON.stringify(res),
                isBase64Encoded: false,
                headers: {
                    'Content-Type': 'application/json'
                }
            } 
        } catch (err) {
            const error = err as Error;
            console.log(`Handling error: ${error.name}\n${error.message}\n${error.stack ?? 'no stack trace'}`);
            if (error instanceof AdmiralError) {
                const aError = error as AdmiralError;
                return {
                    statusCode: aError.statusCode,
                    body: JSON.stringify({
                        name: aError.name,
                        message: aError.message,
                        stack: aError.stack!
                    }),
                    isBase64Encoded: false,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-ErrorType': aError.name
                    }
                }
            } else {
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        name: 'AdmiralApiError',
                        message: 'An unexpected service exception occurred.',
                        stack: error.stack!
                    }),
                    isBase64Encoded: false,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-ErrorType': 'AdmiralApiError'
                    }
                }
            }
        }
    }
}