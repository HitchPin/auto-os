import { aws_ec2 as ec2, aws_s3 as s3, aws_iam as iam, aws_lambda as lambda, custom_resources as cr, CustomResource } from "aws-cdk-lib";
import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as path from 'path';
import type { FiefdomProps } from "@auto-os/opensearch-schemas";

const EXEC_ROOT = process.env["JS_BINARY__EXECROOT"]!;
const FIEFDOM_LAMBDA_LOC = process.env["FIEFDOM_LAMBDA_LOC"]!;

let lambdaLoc: string;
if (!EXEC_ROOT || !FIEFDOM_LAMBDA_LOC) {
  lambdaLoc = "/Users/john/project-maestro/dist/bin/providers/fiefdom/package.zip";
} else {
  lambdaLoc = path.join(EXEC_ROOT, FIEFDOM_LAMBDA_LOC);
}

export class FiefdomInternal extends Construct {
  readonly repoName: string;

  constructor(parent: Construct, name: string, props: FiefdomProps) {
    super(parent, name);

    const r = new iam.Role(this, "Role", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        )
      ],
      inlinePolicies: {
        'controlTower': new iam.PolicyDocument({
            statements: [
                new iam.PolicyStatement({
                    actions: [
                        "controltower:UpdateLandingZone",
                        "controltower:DeleteLandingZone",
                        "controltower:GetLandingZone",
                        "controltower:ResetLandingZone"
                    ],
                    resources: [
                        `arn:aws:controltower:*:${cdk.Aws.ACCOUNT_ID}:landingzone/*`
                    ]
                }),
                new iam.PolicyStatement({
                    actions: [
                        "controltower:GetLandingZoneDriftStatus",
                        "controltower:GetLandingZoneOperation",
                        "controltower:DescribeLandingZoneConfiguration",
                        "controltower:SetupLandingZone",
                        "controltower:GetLandingZoneStatus",
                        "controltower:ListLandingZones",
                        "controltower:CreateLandingZone"
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
      code: lambda.Code.fromAsset(FIEFDOM_LAMBDA_LOC),
      role: r,
      timeout: cdk.Duration.seconds(15),
      memorySize: 1024,
    });
    const isCompleteFunc = new lambda.Function(this, "Func", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handleIsComplete",
      code: lambda.Code.fromAsset(FIEFDOM_LAMBDA_LOC),
      role: r,
      timeout: cdk.Duration.seconds(15),
      memorySize: 1024,
    });
    const provider = new cr.Provider(this, "Provider", {
      onEventHandler: regularFunc,
      isCompleteHandler: isCompleteFunc
    });

    const rsrc = new CustomResource(this, "CustomResource", {
      properties: props,
      serviceToken: provider.serviceToken,
    });
    this.repoName = rsrc.ref;
  }
}