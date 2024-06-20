import type { APIGatewayProxyEvent } from 'aws-lambda';
export interface Handler<TReq, TRes> {
    handle: (req: TReq) => Promise<TRes>;

    deserialize: (r: Pick<APIGatewayProxyEvent, 'body' | 'headers' | 'httpMethod' | 'path'>, pathParams: Map<string, string>) => TReq;

    get name(): string;
    get httpMethod(): 'GET' | 'PUT' | 'POST' | 'DELETE';
    get path(): RegExp;
}
export type PartialProxyEvent = Pick<APIGatewayProxyEvent, 'body' | 'headers' | 'httpMethod' | 'path'>;