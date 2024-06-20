import { HandlerMap } from '../src/HandlerMap';
import { MemoryTenantManager } from './MemoryTenantManager';
import type { Tenant } from '../src/schema';
import { CreateTenantHandler } from '../src/apis/CreateTenant';
import { ListTenantsHandler } from '../src/apis/ListTenants';
import { GetTenantHandler } from '../src/apis/GetTenant';
import { CreateProjectHandler } from '../src/apis/CreateProject';

describe('Handler tests', () => {

    const tenantManager = new MemoryTenantManager();
    const createHandler = new CreateTenantHandler(tenantManager);
    const getHandler = new GetTenantHandler(tenantManager);
    const listHandler = new ListTenantsHandler(tenantManager);
    const createProjectHandler = new CreateProjectHandler({ addProject: (n, p) => { return null as unknown as any}})


    let handlerMap: HandlerMap;

    beforeEach(() => {
        handlerMap = new HandlerMap();
        handlerMap.addHandler(createHandler);
        handlerMap.addHandler(getHandler);
        handlerMap.addHandler(listHandler);
        handlerMap.addHandler(createProjectHandler);
    });

    test('Maps to handler with no path params', async () => {

        const h = handlerMap.getHandler({
            path: '/tenants',
            httpMethod: 'PUT',
            body: '',
            headers: {}
        });
        expect(h).toStrictEqual(createHandler);
    });

    test('Maps to handler with path params', async () => {

        const req = {
            path: '/tenants/asdf',
            httpMethod: 'GET',
            body: '',
            headers: {}
        };

        const h = handlerMap.getHandler(req)!;
        expect(h).toStrictEqual(getHandler);

        const pathParamMatches = req.path.match(h.path);
        const pathParams = new Map<string, string>(Object.entries(pathParamMatches!.groups!));
        const r = getHandler.deserialize(req, pathParams);
        expect(r.name).toBe('asdf')
    });

    test('Maps to handler with exactly zero path params', async () => {

        const req1 = {
            path: '/tenants/',
            httpMethod: 'GET',
            body: '',
            headers: {}
        };

        const h1 = handlerMap.getHandler(req1)!;
        expect(h1).toStrictEqual(listHandler);
        

        const req2 = {
            path: '/tenants',
            httpMethod: 'GET',
            body: '',
            headers: {}
        };

        const h2 = handlerMap.getHandler(req2)!;
        expect(h2).toStrictEqual(listHandler);
    });

    test('Maps handler considering anchor', async () => {

        const req1 = {
            path: '/tenants/',
            httpMethod: 'PUT',
            body: '',
            headers: {}
        };

        const h1 = handlerMap.getHandler(req1)!;
        expect(h1).toStrictEqual(createHandler);
        

        const req2 = {
            path: '/tenants/asdf/projects/',
            httpMethod: 'PUT',
            body: '',
            headers: {}
        };

        const h2 = handlerMap.getHandler(req2)!;
        expect(h2).toStrictEqual(createProjectHandler);
    });
});