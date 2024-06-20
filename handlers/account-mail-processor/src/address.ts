interface TenantAccountAddress {
    tenantId: string,
    projectName: string
}

const domain = process.env['DOMAIN'] ?? 'tenants.auto-os.dev'!
const esc = replaceAll(domain, '.', '\\.');
const pattern = new RegExp(`tenant-(?<tenantId>[^\-]+)-aws-(?<projectName>[^@]+)@${esc}`);

export const extractTenantAccount = (addr: string): TenantAccountAddress | undefined => {

    const m = addr.match(pattern);
    if (!m) return undefined;
    const grp = m!.groups!;
    return {
        tenantId: grp['tenantId'],
        projectName: grp['projectName']
    }
}
export const extractTenantAccounts = (addr: string[]): TenantAccountAddress[] => {

    const accounts: TenantAccountAddress[] = [];
    addr.forEach(add => {
        const t = extractTenantAccount(add);
        if (t === undefined) return;
        accounts.push(t);
    })
    return accounts;
}

function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }
  
  function replaceAll(str: string, find: string, replace: string) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
  }