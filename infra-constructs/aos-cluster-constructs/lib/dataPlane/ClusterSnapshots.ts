import {
    aws_s3 as s3,
    aws_kms as kms,
    aws_iam as iam
} from 'aws-cdk-lib';
import { Construct } from "constructs";
import { fromParams } from '../common';
import type { SnapshottingProps } from '../schema';

interface ClusterSnapshotsProps {
  bucket: s3.IBucket,
  prefix?: string,
  cronSchedule: string
}

export class ClusterSnapshots extends Construct {
  readonly snapshotBucket: s3.IBucket;
  readonly snapshotEncryptionKey: kms.Key;
  readonly snapshotManagerPolicy: iam.ManagedPolicy;

  constructor(parent: Construct, name: string, props: ClusterSnapshotsProps) {
    super(parent, name);

    const info = fromParams(this);
    const names = info.namesFor(this);

    this.snapshotEncryptionKey = new kms.Key(this, "SnapshotKey", {
      alias: names.hyphenatedPrefix + `snapshots`,
    });
    this.snapshotBucket = s3.Bucket.fromBucketName(
      this,
      "SnapshotBucket",
      props.bucket.bucketName
    );

    this.snapshotManagerPolicy = new iam.ManagedPolicy(
      this,
      "SnapshotManager",
      {
        managedPolicyName: names.hyphenatedPrefix + `SnapshotPolicy`,
      }
    );
    this.snapshotBucket.grantReadWrite(this.snapshotManagerPolicy);
  }
}
