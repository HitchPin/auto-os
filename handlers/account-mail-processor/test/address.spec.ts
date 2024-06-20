import { extractTenantAccount } from '../src/address';

describe('address tests', () => {

    test('Extracts info from tenant email.', () => {
        const te = 'tenant-abc123-aws-openSearch1@tenants.auto-os.dev';
        const info = extractTenantAccount(te);
        expect(info?.projectName).toBe('openSearch1');
        expect(info?.tenantId).toBe('abc123');
    });

    test('Returns undefined from invalid  tenant email.', () => {
        const te = 'tenant-abc123aws-openSearch1@tenants.auto-os.dev';
        const info = extractTenantAccount(te);
        expect(info).toBeUndefined();
    });
});