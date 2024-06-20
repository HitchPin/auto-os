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
import { fromParams } from "../common";

interface ApiFuncProps {
  assetBucket: s3.IBucket,
  funcKey: string,
  confPrefix: string;
  vpc: ec2.IVpc;
  subnets: ec2.SubnetSelection;
  encryptionKey: kms.IKey,
  clusterAdminSecret: sm.Secret;
  rootCaSecret: sm.ISecret;
  clusterNameParam: ssm.StringParameter;
  clusterModeParam: ssm.StringParameter;
  eventDedupeQueue: sqs.Queue;
  eventBus: evts.EventBus;
  discoveryNs: svc.IPrivateDnsNamespace;
  discoverySvc: svc.Service;
  extraPolicies: iam.ManagedPolicy[],
}

export class ApiFunc extends Construct {
  readonly func: lambda.Function;

  constructor(parent: Construct, name: string, props: ApiFuncProps) {
    super(parent, name);

    const info = fromParams(this);
    const names = info.namesFor(this);

    const role = new iam.Role(this, "LambdaRole", {
      roleName: names.hyphenatedPrefix + `MaestroApiRequestHandlerRole`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
        ...props.extraPolicies,
      ],
      inlinePolicies: {
        "conf-read-writer": new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["s3:*"],
              resources: [
                props.assetBucket.arnForObjects(props.confPrefix + "*"),
              ],
            }),
          ],
        }),
        secrets: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey"],
              resources: [props.encryptionKey.keyArn],
            }),
            new iam.PolicyStatement({
              actions: [
                "secretsmanager:GetSecretValue",
                "secretsmanager:UpdateSecret",
                "secretsmanager:UpdateSecretVersionStage",
                "secretsmanager:PutSecretValue",
              ],
              resources: [props.rootCaSecret.secretArn, props.clusterAdminSecret.secretArn],
            }),
          ],
        }),
        registrar: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["ec2:DescribeInstances"],
              resources: ["*"],
            }),
            new iam.PolicyStatement({
              actions: ["elasticloadbalancing:DescribeLoadBalancers"],
              resources: ["*"],
            }),
            new iam.PolicyStatement({
              actions: [
                "servicediscovery:DeregisterInstance",
                "servicediscovery:GetNamespace",
                "servicediscovery:RegisterInstance",
                "servicediscovery:GetService",
              ],
              resources: [
                props.discoverySvc.serviceArn,
                props.discoveryNs.namespaceArn,
              ],
            }),
            new iam.PolicyStatement({
              actions: [
                "servicediscovery:ListServices",
                "servicediscovery:ListOperations",
                "servicediscovery:GetOperation",
                "servicediscovery:DiscoverInstances",
                "servicediscovery:ListTagsForResource",
                "servicediscovery:GetInstancesHealthStatus",
                "servicediscovery:ListNamespaces",
                "servicediscovery:GetInstance",
                "servicediscovery:UpdateInstanceCustomHealthStatus",
                "servicediscovery:DiscoverInstancesRevision",
                "servicediscovery:ListInstances",
              ],
              resources: ["*"],
            }),
          ],
        }),
      },
    });

    props.clusterModeParam.grantRead(role);
    props.clusterModeParam.grantWrite(role);
    props.clusterNameParam.grantRead(role);

    this.func = new lambda.Function(this, "MaestroFunc", {
      functionName: names.hyphenatedPrefix + `MaestroApiRequestHandler`,
      code: lambda.Code.fromBucket(props.assetBucket, props.funcKey),
      runtime: lambda.Runtime.PROVIDED_AL2023,
      timeout: cdk.Duration.seconds(10),
      architecture: lambda.Architecture.ARM_64,
      memorySize: 1024,
      handler: "handle",
      role: role,
      environment: {
        ROOT_CA_SECRET_ID: props.rootCaSecret.secretArn,
        CLUSTER_NAME_PARAM_NAME: props.clusterNameParam.parameterName,
        CLUSTER_MODE_PARAM_NAME: props.clusterModeParam.parameterName,
        CONF_BUCKET: props.assetBucket.bucketName,
        CONF_KEY_PREFIX: props.confPrefix,
        CLUSTER_ADMIN_SECRET_ID: props.clusterAdminSecret.secretName,
        DISCO_SVC_ID: props.discoverySvc.serviceId,
        DISCO_NS_NAME: props.discoveryNs.namespaceName,
        DISCO_SVC_NAME: props.discoverySvc.serviceName,
        EVENT_BUS_NAME: props.eventBus.eventBusName,
        EVENT_DEDUPE_QUEUE_URL: props.eventDedupeQueue.queueUrl,
        LB_NAME: `${info.name}-${info.id}`,
      },
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
      }
    });
  }
}
