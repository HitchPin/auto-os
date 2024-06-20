import { MemoryTenantManager } from '../MemoryTenantManager';
import { GetTenantHandler } from '../../src/apis/GetTenant';

describe('GetTenant tests', () => {

    const tenantManager = new MemoryTenantManager();

    let handler: GetTenantHandler;

    beforeEach(() => {
        handler  = new GetTenantHandler(tenantManager);
    });

    test('Handler deserializes API Gateway Request', async () => {
        const req = handler.deserialize({
            path: '/tenants/asdf',
            httpMethod: 'GET',
            headers: {},
            body: ''
        }, new Map<string, string>(Object.entries({ tenantName: 'asdf'})));
        expect(req.name).toBe('asdf');
    });

});