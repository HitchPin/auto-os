import type { InternalProject, Project, Tenant } from '../schema';
export interface ITenantManager {
    addTenant: (t: Tenant) => Promise<string>;
    deleteTenant: (name: string) => Promise<void>;
    getTenant: (name: string) => Promise<Tenant>;
    listTenantNames: () => Promise<string[]>;
}

export interface IProjectManager {
    addProject: (tenantName: string, p: Project) => Promise<string>;
    getProject: (tenantName: string, name: string) => Promise<InternalProject>;
    listTenantProjects: (tenantName: string) => Promise<string[]>;
}