import { aws_s3 as s3, aws_s3_deployment as s3deploy, aws_cloudformation as cfn, cloudformation_include as cfnInclude } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from 'path';
import { shortHashOfFile } from './utils';

type BazelResourceProvider = "rootca-cfn-resource" | "lbcert-cfn-resource";

interface ProviderPaths {
  handlerZip: string;
  bucketPrefix: string;
  resourceStackYaml: string;
}

const getBazelArtifactOf = (
  bazelTargetName: BazelResourceProvider
): ProviderPaths => {
  const providerDir = path.resolve(
    path.join(__dirname, `./providers/cluster-tls/${bazelTargetName}/`)
  );
  const handlerZip = providerDir + "/bundle.zip";
  return {
    handlerZip: handlerZip,
    bucketPrefix: `providers/cluster-tls/${bazelTargetName}/${shortHashOfFile(
      handlerZip
    )}/`,
    resourceStackYaml: providerDir + "/stack.yml",
  };
};

interface ResourceProviderUploaderProps {
  orgBucket: s3.IBucket;
  resourceProvider: BazelResourceProvider;
}

export class ResourceProviderUploader extends Construct {
  readonly handlerKey: string;
  readonly stackFile: string;

  constructor(
    parent: Construct,
    name: string,
    props: ResourceProviderUploaderProps
  ) {
    super(parent, name);

    const paths = getBazelArtifactOf(props.resourceProvider);

    const providerAsset = s3deploy.Source.asset(paths.handlerZip);
    new s3deploy.BucketDeployment(this, `${props.resourceProvider}Deployment`, {
      sources: [providerAsset],
      destinationBucket: props.orgBucket,
      destinationKeyPrefix: paths.bucketPrefix,
    });

    this.handlerKey = paths.bucketPrefix + "handler.zip";
    this.stackFile = paths.resourceStackYaml;
  }
}