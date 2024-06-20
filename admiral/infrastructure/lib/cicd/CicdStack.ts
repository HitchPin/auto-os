import * as cdk from "aws-cdk-lib";
import {
    aws_ec2 as ec2,
    aws_kms as kms,
    aws_s3 as s3,
    aws_codecommit as cc,
    aws_codebuild as cb,
    aws_codepipeline as pipeline,
    aws_codepipeline_actions as actions,
} from "aws-cdk-lib";

export class CicdStack extends cdk.Stack {

    readonly artifactBucket: s3.Bucket;
    readonly artifactKey: kms.Key;
    readonly cicdVpc: ec2.Vpc;

    constructor(scope: cdk.App, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        this.artifactKey = new kms.Key(this, "Key", {
            alias: "hp-auto-os-cicd-artifact-key",
        });
        this.artifactBucket = new s3.Bucket(this, "Bucket", {
            bucketName: "hp-auto-os-pipeline-artifacts",
            encryptionKey: this.artifactKey
        });

        this.cicdVpc = new ec2.Vpc(this, "Vpc", {
            subnetConfiguration: [
                {
                    name: "public",
                    subnetType: ec2.SubnetType.PUBLIC,
                },
            ],
            maxAzs: 1,
        });

        const monorepo = new cc.Repository(this, 'Monorepo', {
            repositoryName: 'auto-os'
        })

        const builder = new cb.Project(this, "BuildProject", {
            buildSpec: cb.BuildSpec.fromSourceFilename("buildspec.yml"),
            source: cb.Source.codeCommit({ repository: monorepo }),
            environment: {
                buildImage: cb.LinuxBuildImage.STANDARD_7_0,
                computeType: cb.ComputeType.LARGE,
            },
        });

        const p = new pipeline.Pipeline(this, "Pipeline", {
            pipelineName: "AutoOs",
            artifactBucket: this.artifactBucket,
        });

        const monorepoSrc = new pipeline.Artifact("monorepoSrc");
        const buildArtifacts = new pipeline.Artifact("buildArtifacts");
        p!.addStage({
            stageName: 'Source',
            actions: [
                new actions.CodeCommitSourceAction({
                    actionName: "Monorepo",
                    repository: monorepo,
                    branch: "main",
                    output: monorepoSrc,
                }),
            ]
        });
        p!.addStage({
            stageName: 'Build',
            actions: [
                new actions.CodeBuildAction({
                    actionName: "Build",
                    project: builder,
                    input: monorepoSrc,
                    outputs: [buildArtifacts],
                    runOrder: 1,
                }),
            ]
        });
    }
}
