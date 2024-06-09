import { aws_s3_assets as assets, aws_imagebuilder as imgb, aws_iam as iam } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as fs from "fs";
import * as path from "path";

const getBazelPluginPath = (): string => {
  return path.join(__dirname, "../plugins/eventing-plugin/eventing-plugin.zip");
};

export class OpenSearchComponent extends Construct {
  readonly imgBuilderComponent: imgb.CfnComponent;
  readonly configProp: imgb.CfnImageRecipe.ComponentConfigurationProperty;
  readonly policy: iam.PolicyStatement;

  constructor(parent: Construct, name: string) {
    super(parent, name);

    const pluginPath = getBazelPluginPath();

    const pluginAsset = new assets.Asset(this, "EventingPluginAsset", {
      path: pluginPath,
    });
    const serviceAsset = new assets.Asset(this, "ServiceAsset", {
      path: path.resolve(__dirname, "./opensearch.service"),
    });

    this.imgBuilderComponent = new imgb.CfnComponent(
      this,
      "OpenSearchComponent",
      {
        name: `OpenSearch`,
        platform: "Linux",
        version: "2.14.0",
        data: getComponent("v2.14.0"),
      }
    );

    this.configProp = {
      componentArn: this.imgBuilderComponent.attrArn,
      parameters: [
        {
          name: "EventingPluginBucketName",
          value: [pluginAsset.bucket.bucketName],
        },
        {
          name: "EventingPluginKey",
          value: [pluginAsset.s3ObjectKey],
        },
        {
          name: "AssetsBucketName",
          value: [serviceAsset.bucket.bucketName],
        },
        {
          name: "ServiceFileKey",
          value: [serviceAsset.s3ObjectKey],
        },
      ],
    };
    this.policy = new iam.PolicyStatement({
      actions: ["s3:GetObject"],
      resources: [
        pluginAsset.bucket.arnForObjects(pluginAsset.s3ObjectKey),
        serviceAsset.bucket.arnForObjects(serviceAsset.s3ObjectKey),
      ],
    });
  }
}

const getComponent = (name: string) => {
  const p = path.join(__dirname, `./${name}.yml`);
  return fs.readFileSync(p).toString("utf8");
};