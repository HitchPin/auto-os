import { z } from 'zod';

export const AccountIdRegex = /^\d{12}$/;
export const ProjectNameRegex = new RegExp('^[a-zA-Z0-9\-_]{4,}$');

const ProjectSchema = z.object({
    name: z.string().regex(ProjectNameRegex),
    description: z.string().optional(),
    pairedAwsAccountId: z.string().regex(AccountIdRegex),
    awsRegion: z.string()
})
type Project = z.infer<typeof ProjectSchema>;

export { ProjectSchema }
export { Project }