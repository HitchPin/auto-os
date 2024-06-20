import type { IProjectManager } from './Types';
import type { InternalProject, Project } from '../schema';
import { InternalProjectSchema } from '../schema';
import { SSM } from '@aws-sdk/client-ssm';
import { DuplicateError, NotFoundError } from '../AdmiralError';
import { MachineStarter, OrgAccountHelper } from '../helper';

const Prefix = '/admiral/project/';

export class SSMOrganizationsProjectManager implements IProjectManager {

    readonly #ssm: SSM;
    readonly #orgHelper: OrgAccountHelper;
    readonly #machineStarter: MachineStarter;

    constructor(ssm: SSM, orgHelper: OrgAccountHelper, starter: MachineStarter) {
        this.#ssm = ssm;
        this.#orgHelper = orgHelper;
        this.#machineStarter = starter;
    }

    addProject = async (tenantName: string, proj: Project): Promise<string> => {

        await this.#ensureProjectNotExists(tenantName, proj.name);

        const account = await this.#orgHelper.create(tenantName, proj!);
        const body = {
            tenantName: tenantName,
            ...proj,
            accountId: account.accountId,
            accountEmail: account.accountEmail
        };

        let projVersion: string;
        try {
            const r = await this.#ssm.putParameter({
                Name: `${Prefix}${tenantName}/${proj.name}`,
                Type: 'String',
                Value: JSON.stringify(body),
                Overwrite: false
            })!;
            projVersion = r.Version!.toString();;
        } catch (err) {
            const name = (err as Error).name;
            if (name === 'ParameterAlreadyExists') {
                throw new DuplicateError('Project already exists with specified name.');
            } else {
                throw err;
            }
        }

        return await this.#machineStarter.start({
            step: 'RegisterBeacon',
            accountProps: account,
            project: proj,
            tenantName: tenantName
        });
    }

    getProject = async (tenantName: string, name: string): Promise<InternalProject> => {

        let str: string;
        try {
            const p = await this.#ssm.getParameter({
                Name: `${Prefix}${tenantName}/${name}`,
            });
            str = p.Parameter!.Value!;
        } catch (err) {
            const errName = (err as Error).name;
            if (errName === 'ParameterNotFound') {
                throw new NotFoundError('No project found with given name in the specified tenant.');
            } else {
                throw err;
            }
        }
        const obj = JSON.parse(str);
        return InternalProjectSchema.parse(obj);
    }

    listTenantProjects = async (tenantName: string): Promise<string[]> => {
        const p = await this.#ssm.describeParameters({
            ParameterFilters: [{
                Key: 'Name',
                Option: 'BeginsWith',
                Values: [`${Prefix}${tenantName}/`]
            }]
        });
        return p.Parameters!.map(p => p.Name!.split('/').slice(-1)[0]);
    }
    
    #ensureProjectNotExists = async (tenantName: string, projectName: string) => {
        try {
            await this.#ssm.getParameter({
                Name: `${Prefix}${tenantName}/${projectName}`
            });
            throw new DuplicateError('Project already exists with given name for given tenant.');
        } catch (err) {
            const name = (err as Error).name;
            if (name === 'ParameterNotFound') {
                return;
            } else {
                throw err;
            }
        }
    }
}