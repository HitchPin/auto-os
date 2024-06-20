import { aws_events as evts, aws_s3 as s3, aws_s3_deployment as s3deploy } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import * as product from './product';
import * as assets from './assets';
import { OrgSharedBucket } from "../../../../infra-constructs/admiral-constructs/dist";
import * as path from 'path';

const EXEC_ROOT = process.env["JS_BINARY__EXECROOT"]!;
const MAESTRO_LAMBDA_LOC = process.env["BUNDLED_ASSETS_LOC"]!;
  
let bundledLoc: string = path.join(EXEC_ROOT, MAESTRO_LAMBDA_LOC);


interface ClusterOfferingStackProps {
    env: cdk.Environment,
    tenantEventBus: evts.EventBus,
    clusterAccountsOuId: string,
    versionId: string,
    encryptionKeyId: string,
    bucketName: string
}

export class ClusterOfferingStack extends cdk.Stack {
  readonly portfolio: product.AutoOsOrgPortfolio;

  constructor(parent: cdk.App, name: string, props: ClusterOfferingStackProps) {
    super(parent, name, props);

    const b = s3.Bucket.fromBucketName(this, 'OrgBucket', props.bucketName);
    const d = new s3deploy.BucketDeployment(this, 'Deployment', {
      sources: [
        s3deploy.Source.asset(bundledLoc),
      ],
      destinationBucket: b,
      destinationKeyPrefix: `${props.versionId}/`,
      serverSideEncryption: s3deploy.ServerSideEncryption.AWS_KMS,
      serverSideEncryptionAwsKmsKeyId: props.encryptionKeyId
    });

    const pa = new assets.BundledProductAssets(this, 'Assets', { 
      bucketName: props.bucketName,
      versionId: props.versionId
    });
    
    this.portfolio = new product.AutoOsOrgPortfolio(this, 'Portfolio', {
      clusterAccountsOuId: props.clusterAccountsOuId,
      assets: pa,
      versionId: props.versionId,
      encryptionKeyId: props.encryptionKeyId
    });
  }
}
