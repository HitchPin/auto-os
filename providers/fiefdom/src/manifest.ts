import type { FiefdomManifest } from '@auto-os/opensearch-schemas'

interface CfnManifest {
    governedRegions: string[],
    organizationStructure: {
        security: {
            name: string
        },
        sandbox: {
            name: string
        }
    },
    centralizedLogging: { enabled: false } | {
        enabled: true,
        accountId: string,
        configurations: {
            loggingBucket: {
                retentionDays: number
            },
            accessLoggingBucket: {
                retentionDays: number
            },
            kmsKeyArn?: string
        }
    },
    securityRoles: {
        accountId: string
    },
    accessManagement: {
        enabled: boolean
    }
 }

export const toCfnManifest = (m: FiefdomManifest): CfnManifest => {
    return {
        governedRegions: m.regions,
        securityRoles: {
            accountId: m.security.accountId
        },
        organizationStructure: {
            sandbox: {
                name: m.layout.generalPopulationOu
            },
            security: {
                name: m.layout.securityOu
            }
        },
        accessManagement: {
            enabled: m.security.accessManagement,
        },
        centralizedLogging: (!!m.logging) ? {
            enabled: true,
            accountId: m.logging.loggingAccountId,
            configurations: {
                loggingBucket: {
                    retentionDays: m.logging.logRetentionDays,
                },
                accessLoggingBucket: {
                    retentionDays: m.logging.accessLogRetentionDays
                },
                kmsKeyArn: m.logging.encryptionKeyArn
            }
        } : { enabled: false }
    }
}