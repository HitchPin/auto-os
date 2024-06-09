import { aws_ec2 as ec2, aws_s3 as s3, aws_iam as iam, aws_lambda as lambda, custom_resources as cr, CustomResource } from "aws-cdk-lib";
import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as path from 'path';
import type { IClusterEndpoint } from "./ClusterEndpoint";

const getBazelHandlerPath = (): string => {
    return path.join(
      __dirname,
      "./providers/opensearch/s3-snapshot-repo/package.zip"
    );
}

interface S3SnapshotRepoProps {
  endpoint: IClusterEndpoint,
  repoName: string;
  bucket: s3.IBucket;
  prefix?: string;
}

export class S3SnapshotRepo extends Construct {

    readonly repoName: string;

  constructor(parent: Construct, name: string, props: S3SnapshotRepoProps) {
    super(parent, name);

    const r = new iam.Role(this, "Role", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
        props.endpoint.clusterPolicy
      ]
    });
    const f = new lambda.Function(this, "Func", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "index.handle",
      code: lambda.Code.fromAsset(getBazelHandlerPath()),
      role: r,
      vpc: props.endpoint.endpointNetworking.vpc,
      vpcSubnets: props.endpoint.endpointNetworking.subnets,
      securityGroups: [props.endpoint.endpointNetworking.securityGroup],
      timeout: cdk.Duration.seconds(15),
      memorySize: 1024
    });
    const provider = new cr.Provider(this, "Provider", {
        onEventHandler: f,
    });

    const stmts: iam.PolicyStatement[] = [
      new iam.PolicyStatement({
        actions: ["s3:*"],
        resources: [props.bucket.bucketArn, props.bucket.arnForObjects("*")],
      }),
    ];
    if (props.bucket.encryptionKey) {
        stmts.push(new iam.PolicyStatement({
          actions: ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey"],
          resources: [
            props.bucket.encryptionKey!.keyArn
          ],
        }));
    }
    const policy = new iam.Policy(this, "S3RepoAccessPolicy", {
      statements: stmts,
    });
    policy.attachToRole(props.endpoint.instanceRole);

    const rsrc = new CustomResource(this, "CustomResource", {
        properties: {
            RepositoryName: props.repoName,
            BucketName: props.bucket.bucketName,
            BasePath: props.prefix ?? '',
            ClusterEndpoint: {
              ClusterUrl: props.endpoint.clusterUrl,
              CredsSecret: props.endpoint.adminCredsSecret.secretArn
            }
        },
        serviceToken: provider.serviceToken,
    });
    this.repoName = rsrc.ref;
  }
}