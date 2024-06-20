import {
    aws_s3 as s3,
    aws_kms as kms,
} from 'aws-cdk-lib';
export interface CommonProps {
    assetBucket: s3.IBucket,
    bucketPrefix?: string,
    encryptionKey: kms.IKey,
    regions: string[],
    managedAccountsOuId: string,
}