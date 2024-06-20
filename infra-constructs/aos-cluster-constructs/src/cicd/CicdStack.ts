import * as cdk from "aws-cdk-lib";
import {
  aws_codecommit as cc,
  aws_codebuild as cb,
  pipelines } from "aws-cdk-lib";

export class CicdStack extends cdk.Stack {
  

  constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const monorepo = new cc.Repository(this, 'Monorepo', {
      repositoryName: 'auto-os'
    })

    const pipeline = new pipelines.CodePipeline(this, "Pipeline", {
      synth: new pipelines.CodeBuildStep("Synth", {
        input: pipelines.CodePipelineSource.codeCommit(monorepo, "main", {}),
        commands: [
          "nix-build",
          "npm run build",
          "npx cdk synth"
        ],
        buildEnvironment: {
          computeType: cb.ComputeType.LARGE,
          buildImage: cb.LinuxBuildImage.fromDockerRegistry('nixos/nix'),
        },
      }),
    });
  }
}
