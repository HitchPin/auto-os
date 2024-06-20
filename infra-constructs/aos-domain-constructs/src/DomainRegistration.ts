import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import {  aws_iam as iam, aws_lambda as lambda, custom_resources as cr, CustomResource } from "aws-cdk-lib";
import * as path from 'path';
import type { RegisterDomainNameRequest } from "@auto-os/opensearch-schemas";

const getBazelHandlerPath = (): string => {
  return path.join(
    __dirname,
    "../dist/providers/r53purchaser/package.zip"
  );
}

export class DomainRegistration extends Construct {

  private readonly rsrc: CustomResource;
  get registryDomainId(): string {
    return this.rsrc.getAttString('RegistryDomainId');
  }
  get registrarName():string {
    return this.rsrc.getAttString('RegistrarName');
  }
  get whoIsServer(): string {
    return this.rsrc.getAttString('WhoIsServer');
  }
  get registrarUrl(): string {
    return this.rsrc.getAttString('RegistrarUrl');
  }
  get abuseContactEmail(): string {
    return this.rsrc.getAttString('AbuseContactEmail');
  }
  get abuseContactPhone(): string {
    return this.rsrc.getAttString('AbuseContactPhone');
  }
  get nameservers(): string[] {
    return cdk.Token.asList(this.rsrc.getAtt('Nameservers')) as string[];
  }

  constructor(parent: Construct, name: string, p: RegisterDomainNameRequest) {
    super(parent, name);

    const r = new iam.Role(this, "Role", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        )
      ],
      inlinePolicies: {
        'r53': new iam.PolicyDocument({
            statements: [
                new iam.PolicyStatement({
                    actions: [
                      "route53domains:DisableDomainTransferLock",
                      "route53domains:ListTagsForDomain",
                      "route53domains:UpdateDomainNameservers",
                      "route53domains:DisableDomainAutoRenew",
                      "route53domains:ResendContactReachabilityEmail",
                      "route53domains:EnableDomainAutoRenew",
                      "route53domains:GetDomainDetail",
                      "route53domains:EnableDomainTransferLock",
                      "route53domains:GetOperationDetail",
                      "route53domains:DeleteDomain",
                      "route53domains:RegisterDomain",
                      "route53domains:UpdateDomainContactPrivacy",
                      "route53domains:UpdateDomainContact",
                      "route53domains:ResendOperationAuthorization"
                    ],
                    resources: [
                        '*'
                    ]
                })
            ]
        })
      }
    });
    const regularFunc = new lambda.Function(this, "Func", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handle",
      code: lambda.Code.fromAsset(getBazelHandlerPath()),
      role: r,
      timeout: cdk.Duration.seconds(15),
      memorySize: 1024,
    });
    const isCompleteFunc = new lambda.Function(this, "Func", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handleIsComplete",
      code: lambda.Code.fromAsset(getBazelHandlerPath()),
      role: r,
      timeout: cdk.Duration.seconds(15),
      memorySize: 1024,
    });
    const provider = new cr.Provider(this, "Provider", {
      onEventHandler: regularFunc,
      isCompleteHandler: isCompleteFunc
    });

    this.rsrc = new CustomResource(this, "CustomResource", {
      properties: p,
      serviceToken: provider.serviceToken,
    });
  }
}