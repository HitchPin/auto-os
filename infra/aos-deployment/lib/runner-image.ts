import * as cdk from "aws-cdk-lib";
import { aws_ecr as ecr, aws_ecs as ecs, aws_codebuild as cb } from "aws-cdk-lib";
import { Construct } from "constructs";
import { TarballImageAsset } from "aws-cdk-lib/aws-ecr-assets";
import * as path from "path";

const getBazelTarballPath = () => {
    const EXEC_ROOT = process.env["JS_BINARY__EXECROOT"]!;
    const CONTAINER_TARBALL = process.env["CONTAINER_TARBALL"]!;
    return path.join(EXEC_ROOT, CONTAINER_TARBALL);
}

interface RunnerImageProps {
    tarballLocation?: string
}

export class RunnerImage extends Construct {
  readonly repo: ecr.Repository;
  readonly imageAsset: TarballImageAsset;
  readonly buildImage: cb.IBuildImage;

  constructor(parent: Construct, name: string, props: RunnerImageProps) {
    super(parent, name);

    this.repo = new ecr.Repository(this, "RunnerRepo", {});
    this.imageAsset = new TarballImageAsset(this, "TarballAsset", {
      tarballFile: props.tarballLocation ?? getBazelTarballPath(),
      
    });


    this.buildImage = cb.LinuxArmBuildImage.fromEcrRepository(
      this.imageAsset.repository,
      this.imageAsset.imageTag
    );
  }
}
