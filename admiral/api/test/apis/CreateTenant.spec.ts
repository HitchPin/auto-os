import { MemoryTenantManager } from '../MemoryTenantManager';
import type { Tenant } from '../../src/schema';
import { CreateTenantHandler } from '../../src/apis/CreateTenant';
import { AdmiralError } from '../../src/AdmiralError';

const SampleTenant: Tenant = {
    name: 'Hitchpin',
    orgDomainName: 'hitchpin.com',
    contactEmail: 'johnathan@hitchpin.com'
}

describe('CreateTenant tests', () => {

    const tenantManager = new MemoryTenantManager();

    let handler: CreateTenantHandler;

    beforeEach(() => {
        handler  = new CreateTenantHandler(tenantManager);
    });

    test('Handler deserializes API Gateway Request', async () => {
        const req = handler.deserialize({
            path: '/tenants',
            httpMethod: 'PUT',
            headers: {},
            body: JSON.stringify(SampleTenant)
        }, new Map<string, string>());
        expect(req.tenant).toStrictEqual(SampleTenant);
    });
    
    test('Handler throws on invalid body', async () => {
        let error: AdmiralError | undefined = undefined;
        try {
        const req = handler.deserialize({
            path: '/tenants',
            httpMethod: 'PUT',
            headers: {},
            body: JSON.stringify({
                ...SampleTenant,
                contactEmail: 'not-a-valid-email'
            })
        }, new Map<string, string>());
    } catch (err) {
        error = err as AdmiralError;
    }
        expect(error).toBeDefined();
        expect(error!.name).toBe('BadRequest');
        expect(error!.statusCode).toBe(400);
        expect(error!.message.includes('contactEmail'))
    });
});