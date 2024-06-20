import type { ITenantManager } from './Types';
import type { Tenant } from '../schema';
import { TenantSchema } from '../schema';
import { SSM } from '@aws-sdk/client-ssm';
import { DuplicateError, NotFoundError } from '../AdmiralError';

const Prefix = '/admiral/tenant/';

export class SSMTenantManager implements ITenantManager {

    readonly #ssm: SSM;

    constructor(ssm: SSM) {
        this.#ssm = ssm;
    }

    addTenant = async (t: Tenant): Promise<string> => {

        const body = Object.assign({}, t);

        try {
            const p = await this.#ssm.putParameter({
                Name: Prefix + t.name,
                Type: 'String',
                Value: JSON.stringify(body),
                Overwrite: false
            });
            return p.Version!.toString();
        } catch (err) {
            const name = (err as Error).name;
            if (name === 'ParameterAlreadyExists') {
                throw new DuplicateError('Tenant already exists with specified name.');
            } else {
                throw err;
            }
        }
    }

    getTenant = async (name: string): Promise<Tenant> => {

        let str: string;
        try {
            const p = await this.#ssm.getParameter({
                Name: Prefix + name
            });
            str = p.Parameter!.Value!;
        } catch (err) {
            const errName = (err as Error).name;
            if (errName === 'ParameterNotFound') {
                throw new NotFoundError('No tenant found with given name.');
            } else {
                throw err;
            }
        }
        const obj = JSON.parse(str);
        return TenantSchema.parse(obj);
    }

    deleteTenant = async (name: string): Promise<void> => {
        await this.#ssm.deleteParameter({
            Name: Prefix + name
        });
    }

    listTenantNames = async (): Promise<string[]> => {
        const p = await this.#ssm.describeParameters({
            ParameterFilters: [{
                Key: 'Name',
                Option: 'BeginsWith',
                Values: [Prefix]
            }]
        });
        return p.Parameters!.map(p => p.Name!.split('/').slice(-1)[0]);
    }
}