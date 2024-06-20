import { z } from 'zod';
import { validate } from 'email-validator';
import { TenantNameRegex } from './Tenant';
import { ProjectNameRegex, AccountIdRegex } from './Project';


const InternalProjectSchema = z.object({
    tenantName: z.string().regex(TenantNameRegex),
    name: z.string().regex(ProjectNameRegex),
    description: z.string().optional(),
    accountId: z.string().regex(AccountIdRegex),
    accountEmail: z.string().refine((a) => validate(a)),
    pairedAwsAccountId: z.string().regex(AccountIdRegex),
    awsRegion: z.string()
})
type InternalProject = z.infer<typeof InternalProjectSchema>;

export { InternalProjectSchema }
export { InternalProject }