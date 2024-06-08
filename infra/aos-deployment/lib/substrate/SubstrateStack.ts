import * as cdk from "aws-cdk-lib";
import {
  aws_ec2 as ec2,
  aws_s3 as s3,
  aws_servicediscovery as srv,
  aws_iam as iam,
  aws_ssm as ssm,
  aws_kms as kms,
} from "aws-cdk-lib";
import * as aosInternal from "../../../aos-cdk-internal/dist";
import { fromParams } from "../common";
import { BaseStack } from "../base";
import { ConfigAssets } from "./ConfigAssets";

export class SubstrateStack extends BaseStack {
  readonly vpc: ec2.IVpc;
  readonly assetsBucket: s3.IBucket;
  readonly discoveryNamespace: srv.IPrivateDnsNamespace;
  readonly hydrateParam: ssm.StringParameter;
  readonly encryptionKey: kms.IKey;
  readonly confPrefix: string;

  constructor(scope: cdk.App, id: string) {
    super(scope, id);

    const info = fromParams(this);
    const names = info.namesFor(this);

    const svpc = new aosInternal.SixyVpc(this, "Vpc", {
      maxAzs: 3,
      keepIpv4: true,
    });
    this.vpc = svpc.vpc;

    this.discoveryNamespace = new srv.PrivateDnsNamespace(
      this,
      "PrivateNamespace",
      {
        name: names.dnsRootParent,
        vpc: this.vpc,
      }
    );
    this.assetsBucket = new s3.Bucket(this, "Assets", {
      bucketName: names.hyphenatedLowercasePrefix + "assets",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.encryptionKey = new kms.Key(this, "Key", {
      description: "Key for " + info.name
    });
    new cdk.CfnOutput(this, "AliasName", {
      value: names.hyphenatedLowercasePrefix + "key",
    });
    this.encryptionKey.addToResourcePolicy(
      new iam.PolicyStatement({
        principals: [new iam.AnyPrincipal()],
        actions: ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey"],
        resources: ["*"],
        conditions: {
          StringEquals: {
            'kms:ViaService': 'lambda.amazonaws.com',
            'kms:CallerAccount': cdk.Aws.ACCOUNT_ID
          }
        },
      })
    );

    const ConfigPrefix = "config/";
    this.hydrateParam = new ssm.StringParameter(this, "HydrateParam", {
      parameterName: names.paramPrefix + "substrate",
      simpleName: false,
      stringValue: cdk.Stack.of(this).toJsonString({
        DiscoNamespaceId: this.discoveryNamespace.namespaceId,
        DiscoNamespaceName: this.discoveryNamespace.namespaceName,
        ConfigBucketName: this.assetsBucket.bucketName,
        ConfigBucketPrefix: ConfigPrefix,
      }),
    });

    new ConfigAssets(this, "Configs", {
      configBucket: this.assetsBucket,
      configPrefix: ConfigPrefix,
    });

    this.confPrefix = ConfigPrefix;
  }
}
