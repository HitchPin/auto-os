import type { Handler, PartialProxyEvent } from "./Handler";
import type { Tenant } from "../schema";
import { BadRequestError } from "../AdmiralError";
import { ITenantManager } from "../data/Types";

interface GetTenantRequest {
    name: string
}
type GetTenantResponse = Tenant;

export interface IGetTenantHandler extends Handler<GetTenantRequest, GetTenantResponse> {};

export class GetTenantHandler implements IGetTenantHandler {

    readonly #tenantManager: ITenantManager;

    constructor(tenantManager: ITenantManager) {
        this.#tenantManager = tenantManager;
    }

    get name(): string {
        return 'GetTenant';
    }
    get httpMethod(): 'GET' {
        return 'GET';
    }
    get path() {
        return new RegExp(`\\/tenants\\/(?<tenantName>[a-zA-Z0-9\\-+]{4,})$`);
    }

    handle = async (req: GetTenantRequest): Promise<GetTenantResponse> => {
        console.log(`Fetching info for tenant ${req.name}.`);
        const t = await this.#tenantManager.getTenant(req.name);
        return t;
    }

    deserialize = (r: PartialProxyEvent, pathParams: Map<string, string>): GetTenantRequest => {
        try {
            return {
                name: pathParams.get('tenantName')!
            }
        } catch (err) {
            const error = err as Error;
            throw new BadRequestError(`Invalid request:\n${error.name}: ${error.message}`);
        }
    }
}