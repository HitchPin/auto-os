import { Handler } from '../src/Handler';
import { MemoryTenantManager } from './MemoryTenantManager';
import type { Tenant } from '../src/schema';
import { CreateTenantHandler } from '../src/apis/CreateTenant';

const SampleTenant: Tenant = {
    name: 'Hitchpin',
    orgDomainName: 'hitchpin.com',
    contactEmail: 'johnathan@hitchpin.com'
}

describe('Handler tests', () => {

    const tenantManager = new MemoryTenantManager();
    const createHandler = new CreateTenantHandler(tenantManager);

    let handler: Handler;

    beforeEach(() => {
        handler  = new Handler({ CreateTenant: createHandler });
    });

    test('Handler returns 404 on unknown operation', async () => {
        const response = await handler.handle({
            path: '/asdf',
            httpMethod: 'PUT',
            headers: {},
            body: ''
        });
        expect(response.statusCode).toBe(404);
        const bodyJson = JSON.parse(response.body);
        expect(bodyJson.name).toBe('OperationNotFound');
        expect(response.headers!['X-ErrorType']).toBe('OperationNotFound');
    });
});