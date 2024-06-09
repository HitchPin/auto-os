import {
  aws_lambda as lambda,
  aws_iam as iam,
  custom_resources as cr,
} from "aws-cdk-lib";
import { Construct, ConstructOrder, Node } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import * as fs from "fs";

const getCode = (): lambda.Code => {
  const lPath = path.resolve(__dirname, "./internal/trusted_svc_enabler.py");
  const src = fs.readFileSync(lPath).toString("utf8");
  return lambda.Code.fromInline(src);
};

const ServicesLookup = {
  AccountManagement: "account.amazonaws.com",
  BillingCostManagement: "billing-cost-management.amazonaws.com",
  // ControlTower: "controltower.amazonaws.com",
  // Config: "config.amazonaws.com",
  Health: "health.amazonaws.com",
  Inspector: "inspector2.amazonaws.com",
  FirewallManager: "fms.amazonaws.com",
  NetworkManager: "networkmanager.amazonaws.com",
  ResourceAccessManager: "ram.amazonaws.com",
  ResourceExplorer: "resource-explorer-2.amazonaws.com",
  StackSets: "stacksets.cloudformation.amazonaws.com",
  ServiceCatalog: "servicecatalog.amazonaws.com",
  ServiceQuotas: "servicequotas.amazonaws.com",
  SSO: "sso.amazonaws.com",
  SystemsManager: "ssm.amazonaws.com",
  TagPolicies: "tagpolicies.tag.amazonaws.com",
} as const;

export type TrustedService = keyof typeof ServicesLookup;

interface FleetTrustedServicesProps {
  services: TrustedService[];
}

export class FleetTrustedServices extends Construct {
  private readonly rsrc: cdk.CustomResource;

  constructor(
    parent: Construct,
    name: string,
    props: FleetTrustedServicesProps
  ) {
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
    if (props.services.includes("ServiceCatalog")) {
      func.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ["servicecatalog:EnableAWSOrganizationsAccess"],
          resources: ["*"],
        })
      );
    }
    if (props.services.includes("ServiceQuotas")) {
      func.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ["servicequotas:AssociateServiceQuotaTemplate"],
          resources: ["*"],
        })
      );
    }
    if (props.services.includes("NetworkManager")) {
      func.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ["networkmanager:StartOrganizationServiceAccessUpdate"],
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
