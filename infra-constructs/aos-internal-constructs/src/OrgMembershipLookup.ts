import * as cdk from "aws-cdk-lib";
import {
  aws_ec2 as ec2,
  aws_iam as iam,
  aws_lambda as lambda,
  custom_resources as cr,
  CustomResource,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { readFileSync } from "fs";
import path = require("path");

export interface OrgMembershipLookupProps {
  throwIfNotInOrg: boolean;
}

export class OrgMembershipLookup extends Construct {

  readonly orgId: string;
  readonly orgArn: string;
  readonly masterAccountId: string;
  readonly myDelegatedAdminServices: string[];

  constructor(
    parent: Construct,
    name: string,
    props: OrgMembershipLookupProps
  ) {
    super(parent, name);

    const fRole = new iam.Role(this, "InstrosepctorRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      inlinePolicies: {
        orgIntrospector: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                "organizations:DescribeOrganization",
                "organizations:ListDelegatedServicesForAccount",
              ],
              resources: ["*"],
            }),
          ],
        }),
      },
    });
    const f = new lambda.SingletonFunction(this, "StrFuncsFunction", {
      uuid: "introspector-func",
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "index.on_event",
      role: fRole,
      code: lambda.Code.fromInline(
        readFileSync(
          path.resolve(__dirname, "./internal/env_introspector.py")
        ).toString("utf8")
      ),
    });
    const p = new cr.Provider(this, "IntrospectorProvider", {
      onEventHandler: f,
    });
    const rsrc = new CustomResource(this, "IntrospectorResource", {
      properties: {
        ThrowIfNotInOrg: props.throwIfNotInOrg,
      },
      serviceToken: p.serviceToken,
    });
    this.orgId = rsrc.getAttString("OrgId");
    this.orgArn = rsrc.getAttString("OrgArn");
    this.masterAccountId = rsrc.getAttString("MasterAccountId");
    this.myDelegatedAdminServices = cdk.Token.asList(
      rsrc.getAtt("MyDelegatedAdminServices")
    );
  }

  static from(c: Construct, throwIfNotInOrg: boolean): OrgMembershipLookup {
    const s = cdk.Stack.of(c);
    const id = `org-membership-lookup-throw-${throwIfNotInOrg}`;
    const pConstruct =
      (s.node.tryFindChild(id) as OrgMembershipLookup) ||
      new OrgMembershipLookup(c, id, { throwIfNotInOrg: throwIfNotInOrg});
    return pConstruct;
  }
}
