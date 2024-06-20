import {
    aws_s3 as s3,
    aws_iam as iam,
    RemovalPolicy,
    Aws
} from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as aosInternal from "../../aos-internal-constructs/dist";
import { OrgSharedKmsKey } from './OrgSharedKmsKey';

type OrgSharedBucketProps = Omit<s3.BucketProps, 'blockPublicAccess' | 'autoDeleteObjects' | 'removalPolicy'
  | 'encryptionKey'>;

export class OrgSharedBucket extends s3.Bucket {
  constructor(parent: Construct, name: string, props: OrgSharedBucketProps) {
    const orgInfo = aosInternal.OrgMembershipLookup.from(parent, true);
    const eKey = new OrgSharedKmsKey(parent, 'Key', {});
    super(parent, name, {
        ...props,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY,
        encryptionKey: eKey
    });

    const stmts: iam.PolicyStatement[] = [
      new iam.PolicyStatement({
        sid: 'share-bucket-with-org',
        principals: [new iam.AnyPrincipal()],
        actions: ["s3:Get*"],
        resources: [
          `arn:aws:s3:::${this.bucketName}`,
          `arn:aws:s3:::${this.bucketName}/*`
        ],
        effect: iam.Effect.ALLOW,
        conditions: {
          StringEquals: {
            "aws:PrincipalOrgID": orgInfo.orgId,
          },
        },
      }),
      new iam.PolicyStatement({
        sid: 'letMeDoAnything',
        principals: [new iam.AccountPrincipal(Aws.ACCOUNT_ID)],
        actions: ["s3:*"],
        resources: [
          `arn:aws:s3:::${this.bucketName}`,
          `arn:aws:s3:::${this.bucketName}/*`
        ],
        effect: iam.Effect.ALLOW
      }),
    ];
    stmts.forEach(s => {
      this.addToResourcePolicy(s);
    })
  }
}