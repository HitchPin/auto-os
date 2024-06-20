import { z } from 'zod';
import { validate } from 'email-validator';

export const TenantNameRegex = new RegExp('^[a-zA-Z0-9\-_]{4,}$');

const validateDomainName = (d: string) => {
    try {
        const u = `https://${d}:443/`;
        new URL(u);
        return true;
    } catch (err) {
        return false;
    }
}

const TenantSchema = z.object({
    name: z.string().regex(TenantNameRegex),
    description: z.string().optional(),
    contactEmail: z.string().refine((a) => validate(a)),
    orgDomainName: z.string().refine((a) => validateDomainName(a)),
})
type Tenant = z.infer<typeof TenantSchema>;

export { TenantSchema }
export { Tenant }