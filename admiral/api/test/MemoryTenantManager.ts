import { ITenantManager } from "../src/data";
import { Tenant } from "../src/schema";

export class MemoryTenantManager implements ITenantManager {

    #m: Map<string, Tenant>;

    constructor() {
        this.#m = new Map<string, Tenant>();
    }

    addTenant = async (t: Tenant): Promise<string> => {
        this.#m.set(t.name, t);
        return t.name;
    }

    getTenant = async (name: string): Promise<Tenant> => {
        const t = this.#m.get(name);
        if (!t) {
            throw new Error('Tenant not found.');
        }
        return t!;
    }
    
    listTenantNames = async (): Promise<string[]> => {
        return Array.from(this.#m.keys());
    }
    deleteTenant = async (name: string): Promise<void> => {
        this.#m.delete(name);
    }
}