import { Construct } from "constructs";
import {
    aws_ecr_assets as assets,
    aws_codebuild as cb,
    aws_s3 as s3,
    aws_iam as iam,
    aws_logs as logs,
    Names,
    Aws,
    RemovalPolicy
} from 'aws-cdk-lib';
import * as path from 'path';

const getBazelTarballPath = () => {
    const tar = path.join(__dirname, '../infra/runner-container-image/runner-container-image/tarball.tar');
    return tar;
}

export class MaestroAdminCodeBuildProject extends Construct {
  readonly artifactBucket: s3.IBucket;
  readonly cbProject: cb.IProject;
  readonly commonInvocationPermissions: iam.ManagedPolicy;
  readonly logGroup: logs.ILogGroup;

  constructor(parent: Construct, name: string, props: {}) {
    super(parent, name);
    const imageAsset = new assets.TarballImageAsset(this, "ImageAsset", {
      tarballFile: getBazelTarballPath(),
    });
    const cbImage = cb.LinuxArmBuildImage.fromEcrRepository(
      imageAsset.repository,
      imageAsset.imageTag
    );

    const nameRoot = Names.uniqueResourceName(this, {
      allowedSpecialCharacters: "-",
      maxLength: 50
    });
    this.artifactBucket = new s3.Bucket(this, "Bucket", {
      bucketName: `${nameRoot.toLocaleLowerCase()}-artifacts`,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    this.logGroup = new logs.LogGroup(this, "InvocationLogs", {
      logGroupName: `${nameRoot}-Logs`,
      removalPolicy: RemovalPolicy.DESTROY
    });

    this.commonInvocationPermissions = new iam.ManagedPolicy(
      this,
      "CommonPermissions",
      {
        managedPolicyName: `${nameRoot}-CommonPermissionsPolicy`,
        statements: [
          new iam.PolicyStatement({
            actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
            resources: [
              `arn:aws:logs:*:${Aws.ACCOUNT_ID}:log-group:${this.logGroup.logGroupName}:log-stream:*`,
            ],
          }),
          new iam.PolicyStatement({
            actions: [
              "ecr:BatchGetImage",
              "ecr:BatchCheckLayerAvailability",
              "ecr:GetDownloadUrlForLayer",
            ],
            resources: [cbImage.repository!.repositoryArn],
          }),
          new iam.PolicyStatement({
            actions: ["ecr:GetAuthorizationToken"],
            resources: ['*']
          }),
        ],
      }
    );
    cbImage.repository!.grantPull

    const tmpRole = new iam.Role(this, "Role", {
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
    });

    this.cbProject = new cb.Project(this, "Project", {
      environment: {
        buildImage: cbImage,
      },
      projectName: nameRoot,
      logging: {
        cloudWatch: {
          enabled: true,
          logGroup: this.logGroup,
        },
      },
      artifacts: cb.Artifacts.s3({
        bucket: this.artifactBucket,
        packageZip: false,
        encryption: false
      }),
      role: tmpRole,
      buildSpec: cb.BuildSpec.fromObject({
        version: 0.2,
        phases: { build: { commands: [] } },
      }),
    });
  }
}