import {
    aws_servicecatalog as svcCat,
    aws_s3 as s3,
    aws_lambda as lambda,
    aws_s3_deployment as s3deploy,
    aws_kms as kms
} from "aws-cdk-lib";
import { Construct } from "constructs";

interface MaestroFuncProductProps {
  orgBucketName: string,
  maestroFuncKey: string,
  assetBucket: s3.IBucket,
  encryptionKeyId: string
}
export class MaestroFuncProduct extends svcCat.ProductStack {

  constructor(parent: Construct, name: string, props: MaestroFuncProductProps) {
    super(parent, name, {
      assetBucket: props.assetBucket,
      serverSideEncryption: s3deploy.ServerSideEncryption.AWS_KMS,
      serverSideEncryptionAwsKmsKeyId: props.encryptionKeyId
    });

    new lambda.Function(this, 'Func', {
        runtime: lambda.Runtime.PROVIDED_AL2,
        handler: 'bootstrap',
        code: lambda.Code.fromBucket(props.assetBucket, props.maestroFuncKey)
    });
  }
}
