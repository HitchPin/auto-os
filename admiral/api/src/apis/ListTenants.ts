import type { Handler, PartialProxyEvent } from "./Handler";
import type { Tenant } from "../schema";
import { BadRequestError } from "../AdmiralError";
import { ITenantManager } from "../data/Types";

interface ListTenantsRequest {
}
interface ListTenantsResponse {
    tenants: string[]
}

export interface IListTenantsHandler extends Handler<ListTenantsRequest, ListTenantsResponse> {};

export class ListTenantsHandler implements IListTenantsHandler {

    readonly #tenantManager: ITenantManager;

    constructor(tenantManager: ITenantManager) {
        this.#tenantManager = tenantManager;
    }

    get name(): string {
        return 'ListTenants';
    }
    get httpMethod(): 'GET' {
        return 'GET';
    }
    get path() {
        return /\/tenants\/?$/;
    }

    handle = async (req: ListTenantsRequest): Promise<ListTenantsResponse> => {

        const names = await this.#tenantManager.listTenantNames();
        console.log(`Found tenant names: ${names}`);
        return {
            tenants: names
        };
    }

    deserialize = (r: PartialProxyEvent, pathParams: Map<string, string>): ListTenantsRequest => {
        return {};
    }
}