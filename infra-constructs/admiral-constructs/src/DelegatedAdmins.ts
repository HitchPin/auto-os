import {
  aws_lambda as lambda,
  aws_iam as iam,
  custom_resources as cr,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import * as fs from "fs";

const getCode = (): lambda.Code => {
  const lPath = path.resolve(__dirname, "./internal/delegated_admin.py");
  const src = fs.readFileSync(lPath).toString("utf8");
  return lambda.Code.fromInline(src);
};

const ServicesLookup = {
  AccountManagement: "account.amazonaws.com",
  CloudTrail: "cloudtrail.amazonaws.com",
  Config: "config.amazonaws.com",
  Health: "health.amazonaws.com",
  Inspector: "inspector2.amazonaws.com",
  FirewallManager: "fms.amazonaws.com",
  ResourceExplorer: "resource-explorer-2.amazonaws.com",
  StackSets: "stacksets.cloudformation.amazonaws.com",
  SSO: "sso.amazonaws.com",
  SystemsManager: "ssm.amazonaws.com",
  TagPolicies: "tagpolicies.tag.amazonaws.com",
} as const;

export type TrustedService = keyof typeof ServicesLookup;

interface DelegatedAdminsProps {
  services: TrustedService[];
}

export class DelegatedAdmins extends Construct {
  private readonly rsrc: cdk.CustomResource;

  constructor(parent: Construct, name: string, props: DelegatedAdminsProps) {
    super(parent, name);

    const func = new lambda.Function(this, "Func", {
      code: getCode(),
      runtime: lambda.Runtime.PYTHON_3_12,
      timeout: cdk.Duration.minutes(1),
      handler: "index.on_event",
    });
    func.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["organizations:EnableAWSServiceAccess"],
        resources: ["*"],
      })
    );
    func.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["*"],
        resources: ["*"],
      })
    );

    if (props.services.includes("StackSets")) {
      func.addToRolePolicy(
        new iam.PolicyStatement({
          actions: [
            "cloudformation:ActivateOrganizationsAccess",
            "cloudformation:DescribeOrganizationsAccess",
            "cloudformation:DeactivateOrganizationsAccess",
          ],
          resources: ["*"],
        })
      );
    }
    if (props.services.includes("CloudTrail")) {
      func.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ["cloudtrail:RegisterOrganizationDelegatedAdmin"],
          resources: ["*"],
        })
      );
    }
    func.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "iam:GetRole",
          "iam:CreateServiceLinkedRole",
          "iam:CreateRole",
          "iam:GetServiceLinkedRole",
        ],
        resources: [
          `arn:${cdk.Aws.PARTITION}:iam::${cdk.Aws.ACCOUNT_ID}:role/*`,
        ],
      })
    );

    const provider = new cr.Provider(this, "Provider", {
      onEventHandler: func,
    });
    this.rsrc = new cdk.CustomResource(this, "CustomResource", {
      properties: {
        ServicePrincipals: props.services.map((s) => ServicesLookup[s]),
      },
      serviceToken: provider.serviceToken,
    });
  }

  addDependency = (r: cdk.CfnResource) => {
    (this.rsrc.node.defaultChild as cdk.CfnResource).addDependency(r);
  };

  get cfnResource(): cdk.CfnResource {
    return this.rsrc.node.defaultChild as cdk.CfnResource;
  }
}
