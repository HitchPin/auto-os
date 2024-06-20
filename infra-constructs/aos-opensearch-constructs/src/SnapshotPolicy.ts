import { aws_iam as iam, aws_lambda as lambda, custom_resources as cr, CustomResource } from "aws-cdk-lib";
import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as path from 'path';
import { IClusterEndpoint } from "./ClusterEndpoint";
import type { CreateSnapshotPolicyRequest } from "@auto-os/opensearch-schemas";

const getBazelHandlerPath = (): string => {
  return path.join(
    __dirname,
    "../dist/providers/opensearch/snapshot-policy/package.zip"
  );
}

type SnapshotPolicyProps = CreateSnapshotPolicyRequest & {
  endpoint: IClusterEndpoint;
}

export class SnapshotPolicy extends Construct {
  readonly repoName: string;

  constructor(parent: Construct, name: string, props: SnapshotPolicyProps) {
    super(parent, name);

    const r = new iam.Role(this, "Role", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
        props.endpoint.clusterPolicy,
      ],
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
      memorySize: 1024,
    });
    const provider = new cr.Provider(this, "Provider", {
      onEventHandler: f,
    });

    const resourceProps: CreateSnapshotPolicyRequest = Object.assign({}, props);
    delete (resourceProps as { endpoint?: IClusterEndpoint })['endpoint'];

    const rsrc = new CustomResource(this, "CustomResource", {
      properties: {
        ...resourceProps,
        ClusterEndpoint: {
          ClusterUrl: props.endpoint.clusterUrl,
          CredsSecret: props.endpoint.adminCredsSecret.secretArn,
        },
      },
      serviceToken: provider.serviceToken,
    });
    this.repoName = rsrc.ref;
  }
}