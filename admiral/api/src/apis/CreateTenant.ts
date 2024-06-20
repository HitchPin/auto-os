import type { Handler, PartialProxyEvent } from "./Handler";
import type { Tenant } from "../schema";
import { TenantSchema } from "../schema";
import { BadRequestError } from "../AdmiralError";
import { ITenantManager } from "../data/Types";
import { ZodError } from "zod";

interface CreateTenantRequest {
    tenant: Tenant
}
interface CreateTenantResponse {
    id: string
}

export interface ICreateTenantHandler extends Handler<CreateTenantRequest, CreateTenantResponse> {};

export class CreateTenantHandler implements ICreateTenantHandler {

    readonly #tenantManager: ITenantManager;

    constructor(tenantManager: ITenantManager) {
        this.#tenantManager = tenantManager;
    }

    get name(): string {
        return 'CreateTenant';
    }
    get httpMethod(): 'PUT' {
        return 'PUT';
    }
    get path() {
        return new RegExp('\\/tenants\\/?$');
    }

    handle = async (req: CreateTenantRequest): Promise<CreateTenantResponse> => {

        const id = await this.#tenantManager.addTenant(req.tenant);
        return {
            id: id
        };
    }

    deserialize = (r: PartialProxyEvent, pathParams: Map<string, string>): CreateTenantRequest => {
        try {
            const obj = JSON.parse(r.body!);
            const tenant: Tenant = TenantSchema.parse(obj);
            return {
                tenant: tenant
            }
        } catch (err) {
            const error = err as ZodError;
            throw new BadRequestError(`Invalid request:\n${error.format()._errors.join('; ')}`);
        }
    }
}