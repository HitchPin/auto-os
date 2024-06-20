import {
  aws_organizations as org,
  aws_kms as kms,
  region_info as regions
} from "aws-cdk-lib";
import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as path from 'path';
import { FiefdomPrereqs } from './internal/FiefdomPrereqs';
import { FiefdomInternal } from './internal/FiefdomInternal';
import type { FiefdomManifest } from "@auto-os/opensearch-schemas";

interface LoggingConfig {
  account: org.CfnAccount,
  logRetention: cdk.Duration,
  accessLogRetention: cdk.Duration,
  encryptionKey: kms.Key
}
interface SecurityConfig {
  accountId: string,
  orgUnitName: string,
  accessManagement: boolean
}
interface LayoutConfig {
  securityOu: string,
  generalOu: string
}
interface FiefdomProps {
  readonly logging?: LoggingConfig;
  readonly security: SecurityConfig;
  readonly layout: LayoutConfig;
  readonly regions: string[];
}

export class Fiefdom extends Construct {

  private readonly fiefdomPrereqs: FiefdomPrereqs;
  private readonly fiefdom: FiefdomInternal;

  constructor(parent: Construct, name: string, props: FiefdomProps) {
    super(parent, name);

    this.fiefdomPrereqs = new FiefdomPrereqs(this, 'Prereqs');

    const usRegions: string[] = [];
    regions.Fact.regions.filter(r => r.startsWith('us-')).forEach(r => usRegions.push(r));

    const manifest: FiefdomManifest = {
      layout: {
        securityOu: props.layout.securityOu,
        generalPopulationOu: props.layout.generalOu
      },
      security: {
        accessManagement: props.security.accessManagement,
        accountId: props.security.accountId
      },
      logging: (!!props.logging) ? {
        enabled: true,
        encryptionKeyArn: props.logging!.encryptionKey?.keyArn,
        loggingAccountId: props.logging!.account.attrAccountId,
        logRetentionDays: Math.ceil(props.logging!.logRetention.toDays()),
        accessLogRetentionDays: Math.ceil(props.logging.accessLogRetention.toDays())
      } : { enabled: false },
      regions: props.regions
    };
    this.fiefdom = new FiefdomInternal(this, 'Internal', {
      ManifestJsonString: cdk.Fn.toJsonString(manifest)
    });
  }
}
