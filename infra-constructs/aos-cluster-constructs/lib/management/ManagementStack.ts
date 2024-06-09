import * as cdk from "aws-cdk-lib";
import {
  aws_ssm as ssm,
  aws_s3 as s3,
  aws_kms as kms,
  aws_ec2 as ec2,
  aws_iam as iam
} from "aws-cdk-lib";
import * as aosInternal from   "../../../aos-internal-constructs/dist";
import * as aosOpensearch from "../../../aos-opensearch-constructs/dist";
import { fromParams } from "../common";
import { BaseStack } from "../base";

interface ManagementStackProps {
  vpc: ec2.IVpc;
  instanceRole: iam.Role;
  encryptionKey: kms.IKey,
  substrateHydrateParam: ssm.IStringParameter;
  controlPlaneHydrateParam: ssm.IStringParameter;
  dataPlaneHydrateParam: ssm.IStringParameter;
}

export class ManagementStack extends BaseStack {

  constructor(scope: cdk.App, id: string, props: ManagementStackProps) {
    super(scope, id);

    const info = fromParams(this);

    const invocation = new aosInternal.MaestroAdminInvocation(this, "GetRootExample", {
      hydration: {
        substrate: props.substrateHydrateParam,
        controlPlane: props.controlPlaneHydrateParam,
        dataPlane: props.controlPlaneHydrateParam,
      },
      cliCommand: "certs get-root"
    });
    new cdk.CfnOutput(this, "MaestroAdminCliOutput", {
      value: invocation.commandOutput,
    });

    const b = new s3.Bucket(this, 'Bucket', {
      encryptionKey: props.encryptionKey
    });

    const clusterEp = new aosOpensearch.ClusterEndpoint(this, "Endpoint", {
      vpc: props.vpc,
      instanceRole: props.instanceRole,
      encryptionKey: props.encryptionKey,
      controlPlaneHydrateParam: props.controlPlaneHydrateParam,
      dataPlaneHydrateParam: props.dataPlaneHydrateParam,
    });
    new cdk.CfnOutput(this, "ClusterUrl", {
      value: clusterEp.clusterUrl
    });

    const repo = new aosOpensearch.S3SnapshotRepo(this, "Repo", {
      endpoint: clusterEp,
      bucket: b,
      repoName: "s3-repo",
    });
    
    new aosOpensearch.SnapshotPolicy(this, "SnapshotPolicy", {
      endpoint: clusterEp,
      PolicyName: "daily-policy",
      SnapshotConfig: {
        Repository: repo.repoName,
        IgnoreUnavailable: true,
        Partial: true,
        IncludeGlobalState: false
      },
      Creation: {
        Schedule: "0 8 * * *",
        TimeLimit: "1h",
      },
      Deletion: {
        Schedule: "0 1 * * *",
        Condition: {
          MaxAge: '7d',
          MaxCount: 21,
          MinCount: 7
        },
        TimeLimit: '1h'
      },
    });
  }
}
