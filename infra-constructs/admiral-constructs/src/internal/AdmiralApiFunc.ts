import {
  aws_lambda as lambda,
  aws_ec2 as ec2,
  aws_secretsmanager as sm,
  aws_ssm as ssm,
  aws_iam as iam,
  aws_sqs as sqs,
  aws_events as evts,
  aws_kms as kms,
  aws_s3 as s3,
  aws_servicediscovery as svc,
} from "aws-cdk-lib";
import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as path from 'path';

const EXEC_ROOT = process.env["JS_BINARY__EXECROOT"]!;
const ADMIRAL_API_LAMBDA_LOC = process.env["ADMIRAL_API_LAMBDA_LOC"]!;

let lambdaLoc: string;
if (!EXEC_ROOT || !ADMIRAL_API_LAMBDA_LOC) {
  lambdaLoc = "/Users/john/project-maestro/dist/bin/admiral/api/package.zip";
} else {
  lambdaLoc = path.join(EXEC_ROOT, ADMIRAL_API_LAMBDA_LOC);
}

interface AdmiralApiFuncProps {
  accountEmailDomainName: string,
  orgRootId: string,
  destinationOuId: string,
  orgRoleArn: string
}

export class AdmiralApiFunc extends Construct {
  readonly apiFunc: lambda.Function;
  readonly machineFunc: lambda.Function;

  constructor(parent: Construct, name: string, props: AdmiralApiFuncProps) {
    super(parent, name);

    const role = new iam.Role(this, "LambdaRole", {
      roleName: `AdmiralApiLambdaRole`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
      inlinePolicies: {
        "ssm-read-writer": new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["ssm:PutParameter", "ssm:GetParameter", "ssm:DescribeParameters", "ssm:DeleteParameter"],
              resources: [
                `arn:aws:ssm:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:parameter/admiral/tenant/*`,
                `arn:aws:ssm:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:parameter/admiral/project/*`,
              ],
            }),
          ],
        }),
        "ssm-lister": new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["ssm:DescribeParameters"],
              resources: [
                '*'
              ],
            }),
          ],
        }),
        "org-registrar": new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                "organizations:CreateAccount",
                "organizations:DescribeOrganization",
                "organizations:DescribeCreateAccountStatus",
                "organizations:MoveAccount",
                "iam:CreateServiceLinkedRole"
              ],
              resources: [
                '*'
              ],
            }),
            new iam.PolicyStatement({
              actions: [
                'sts:AssumeRole'
              ],
              resources: [
                '*'
              ]
            })
          ],
        }),
        "machine-starter": new iam.PolicyDocument({
          statements: [new iam.PolicyStatement({
            actions: [
              "states:SendTaskSuccess",
              "states:SendTaskFailure",
              "states:DescribeStateMachine",
              "states:DescribeExecution",
              "states:ListExecutions",
              "states:GetExecutionHistory",
              "states:StartExecution",
              "states:StopExecution",
              "states:StartSyncExecution",
              "states:GetActivityTask"
            ],
            resources: [ '*' ]
          })]
        })
      },
    });

    const envs: Record<string, string> = {
      'EMAIL_DOMAIN': props.accountEmailDomainName,
      'ORG_ROOT_ID': props.orgRootId,
      'DEST_OU_ID': props.destinationOuId,
      'ORG_ACCOUNT_CREATION_ROLE_ARN': props.orgRoleArn,
      'ADMIN_ACCOUNT_ID': cdk.Aws.ACCOUNT_ID,
      'ACCOUNT_MACHINE_ARN': `arn:${cdk.Aws.PARTITION}:states:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:stateMachine:AdmiralAccountFactory`
    };
    const funcProps: Omit<lambda.FunctionProps, 'handler' | 'functionName'> = {
      code: lambda.Code.fromAsset(lambdaLoc),
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(1),
      memorySize: 1024,
      role: role,
      environment: envs
    };
    this.apiFunc = new lambda.Function(this, "ApiFunc", {
      ...funcProps,
      functionName: `AdmiralApiCallHandler`,
      handler: "index.handle",
    });
    this.machineFunc = new lambda.Function(this, "MachineFunc", {
      ...funcProps,
      functionName: `AdmiralMachineTaskHandler`,
      handler: "index.handleMachine",
    });
  }
}
