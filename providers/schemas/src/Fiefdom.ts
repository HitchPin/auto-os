import { z } from 'zod';

const FiefdomLoggingDisabledSchema = z.object({
  enabled: z.literal(false)
});
const FiefdomLoggingEnabledSchema = z.object({
  enabled: z.literal(true),
  loggingAccountId: z.string(),
  logRetentionDays: z.number().int().gte(1).lte(10 * 365),
  accessLogRetentionDays: z.number().int().gte(1).lte(10 * 365),
  encryptionKeyArn: z.string().optional(),
});
const FiefdomLoggingSchema = z.union([FiefdomLoggingDisabledSchema, FiefdomLoggingEnabledSchema]);
const FiefdomSecuritySchema = z.object({
  accountId: z.string(),
  accessManagement: z.boolean()
});
const FiefdomLayoutSchema = z.object({
  securityOu: z.string(),
  generalPopulationOu: z.string()
});
const FiefdomManifestSchema = z.object({
  regions: z.array(z.string()).optional(),
  security: FiefdomSecuritySchema.required(),
  logging: FiefdomLoggingSchema.optional(),
  layout: FiefdomLayoutSchema.required()
});
export type FiefdomManifest = z.infer<typeof FiefdomManifestSchema>;

export interface FiefdomProps {
    ManifestJsonString: string
}

export { FiefdomManifestSchema };