import * as cdk from 'aws-cdk-lib';
import {
  aws_ec2 as ec2,
  aws_codebuild as cb
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodeBuildRunner } from "./runner";
import { RunnerImage } from './runner-image';
import * as path from 'path';

export class AosDeploymentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const runnerImage = new RunnerImage(this, 'RunnerImage', {});

    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 1,
      subnetConfiguration: [
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: "public",
        },
        {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          name: "private",
        },
      ],
    });
    new CodeBuildRunner(this, "Runner", {
      buildImage: runnerImage.buildImage,
      buildSpec: cb.BuildSpec.fromAsset(
        path.resolve(__dirname, "./buildspec.yml")
      ),
      vpc: vpc,
    });
  }
}
