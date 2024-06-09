import {
    aws_organizations as org,
    aws_iam as iam,
    custom_resources as cr
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FleetTrustedServices } from "./FleetTrustedServices";
import type { TrustedService } from './FleetTrustedServices';

interface AdmiralFleetProps {
  trustedServices: TrustedService[];
  domainName: string;
  emailPrefix: string;
  accountsNames: {
    delegatedAdmin: string;
    logging: string;
    security: string;
  };
}

export class AdmiralFleet extends Construct {
  readonly organization: org.CfnOrganization;
  readonly managementOu: org.CfnOrganizationalUnit;
  readonly clusterAccountsOu: org.CfnOrganizationalUnit;

  readonly delegatedAdmin: org.CfnAccount;
  readonly loggingAccount: org.CfnAccount;
  readonly securityAccount: org.CfnAccount;

  constructor(parent: Construct, name: string, props: AdmiralFleetProps) {
    super(parent, name);

    this.organization = new org.CfnOrganization(this, "Organization", {
      featureSet: "ALL",
    });

    const trs = new FleetTrustedServices(this, "TrustedServices", {
      services: props.trustedServices,
    });
    trs.addDependency(this.organization);

    this.managementOu = new org.CfnOrganizationalUnit(this, "ManagementOu", {
      parentId: this.organization.attrRootId,
      name: "management-accounts",
    });
    this.clusterAccountsOu = new org.CfnOrganizationalUnit(
      this,
      "ClusterAccountsOu",
      {
        parentId: this.organization.attrRootId,
        name: "cluster-accounts",
      }
    );

    const newAccount = (name: string) => {
      const a = new org.CfnAccount(this, name, {
        accountName: name,
        email: props.emailPrefix + "+" + name + "@" + props.domainName,
        parentIds: [this.managementOu.attrId],
      });
      a.addDependency(trs.cfnResource);
      return a;
    };

    this.delegatedAdmin = newAccount(props.accountsNames.delegatedAdmin);
    this.loggingAccount = newAccount(props.accountsNames.logging);
    this.securityAccount = newAccount(props.accountsNames.security);
  }
}