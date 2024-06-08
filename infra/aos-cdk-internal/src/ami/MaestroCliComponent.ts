import { aws_s3_assets as assets, aws_imagebuilder as imgb, aws_iam as iam } from "aws-cdk-lib";
import { Construct } from 'constructs';
import * as fs from "fs";
import * as path from 'path';
import * as p from "node:child_process";

interface IArchPaths {
    arm_64: string,
    x86_64: string,
    native: string
}
const getBazelMaestroCliPath = (): IArchPaths => {
  const clientCliDir = path.join(__dirname, "../maestro/client-cli");
  const ps = {
    arm_64: path.join(clientCliDir, "bin-arm64_/bin-arm64"),
    x86_64: path.join(clientCliDir, "bin-x86_64_/bin-x86_64"),
    native: path.join(clientCliDir, "client-cli_/client-cli"),
  };
  if (!fs.statSync(ps.arm_64).size) {
    throw new Error(`Did not find arm64 binary at ${ps.arm_64}`);
  }
  if (!fs.statSync(ps.x86_64).size) {
    throw new Error(`Did not find x86_64 binary at ${ps.x86_64}`);
  }
  if (!fs.statSync(ps.native).size) {
    throw new Error(`Did not find native binary at ${ps.native}`);
  }
  return ps;
};

export class MaestroCliComponent extends Construct {

    readonly imgBuilderComponent: imgb.CfnComponent;
    readonly configProp: imgb.CfnImageRecipe.ComponentConfigurationProperty;
    readonly policy: iam.PolicyStatement;

    constructor(parent: Construct, name: string) {
        super(parent, name);

        const bzlPaths = getBazelMaestroCliPath();
        const version = getVersion(bzlPaths);

        const armAsset = new assets.Asset(this, "MaestroARMCliAsset", {
            path: bzlPaths.arm_64
        });
        const amdAsset = new assets.Asset(this, "MaestroAmdCliAsset", {
            path: bzlPaths.x86_64,
        });

        this.imgBuilderComponent = new imgb.CfnComponent(this, "MaestroClientCli", {
            name: `MaestroClientCli`,
            platform: "Linux",
            version: version,
            data: getComponent("maestro"),
        });

        this.configProp = {
          componentArn: this.imgBuilderComponent.attrArn,
          parameters: [
            {
              name: "ArmAssetsBucketName",
              value: [armAsset.bucket.bucketName],
            },
            {
              name: "ArmAssetsBucketKey",
              value: [armAsset.s3ObjectKey],
            },
            {
              name: "AmdAssetsBucketName",
              value: [amdAsset.bucket.bucketName],
            },
            {
              name: "AmdAssetsBucketKey",
              value: [amdAsset.s3ObjectKey],
            },
          ],
        };
    this.policy = new iam.PolicyStatement({
      actions: ["s3:GetObject"],
      resources: [
        amdAsset.bucket.arnForObjects(amdAsset.s3ObjectKey),
        armAsset.bucket.arnForObjects(armAsset.s3ObjectKey),
      ],
    });
    }
}

const getComponent = (name: string) => {
  const p = path.join(__dirname, `./${name}.yml`);
  return fs.readFileSync(p).toString("utf8");
};

const getVersion = (p: IArchPaths): string => {
    const nativeV = tryGetVersion(p.native);
    if (nativeV) return nativeV;
    const armV = tryGetVersion(p.arm_64);
    if (armV) return armV;
    const amdV = tryGetVersion(p.x86_64);
    if (amdV) return amdV;
    throw new Error(
        "Cannot determine version from either ARM_64 or X86_64 binaries."
    );
}

const tryGetVersion = (cliLoc: string): string | undefined => {

    var child = p.spawnSync(cliLoc, ["-v"], {
      encoding: "utf8",
    });
    if (child.error) {
     return undefined;
    }
    const semVerRegex = new RegExp(`[0-9]+\.[0-9]+\.[0-9]+`);
    const stdOut = child.output!.join("\n");
    const m = stdOut.match(semVerRegex);

    if (!m || !m[0]) {
      return undefined;
    }
    return m[0];
}