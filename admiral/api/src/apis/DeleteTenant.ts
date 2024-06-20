import type { Handler, PartialProxyEvent } from "./Handler";
import type { Tenant } from "../schema";
import { BadRequestError } from "../AdmiralError";
import { ITenantManager } from "../data/Types";

interface DeleteTenantRequest {
    name: string
}
interface DeleteTenantResponse {
}

export interface IDeleteTenantHandler extends Handler<DeleteTenantRequest, DeleteTenantResponse> {};

export class DeleteTenantHandler implements IDeleteTenantHandler {

    readonly #tenantManager: ITenantManager;

    constructor(tenantManager: ITenantManager) {
        this.#tenantManager = tenantManager;
    }

    get name(): string {
        return 'DeleteTenant';
    }
    get httpMethod(): 'DELETE' {
        return 'DELETE';
    }
    get path() {
        return new RegExp(`\\/tenants\\/(?<tenantName>[a-zA-Z0-9\\-+]{4,})$`);
    }

    handle = async (req: DeleteTenantRequest): Promise<DeleteTenantResponse> => {
        console.log(`Deleting tenant ${req.name}.`);
        await this.#tenantManager.deleteTenant(req.name);
        return {};
    }

    deserialize = (r: PartialProxyEvent, pathParams: Map<string, string>): DeleteTenantRequest => {
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