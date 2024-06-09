import {
    aws_s3 as s3,
    aws_iam as iam,
    RemovalPolicy
} from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as aosInternal from "../../aos-internal-constructs/dist";

type OrgSharedBucketProps = s3.BucketProps;

export class OrgSharedBucket extends s3.Bucket {
  constructor(parent: Construct, name: string, props: OrgSharedBucketProps) {
    const orgInfo = aosInternal.OrgMembershipLookup.from(parent, true);
    super(parent, name, {
        ...props,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
        autoDeleteObjects: true,
        removalPolicy: RemovalPolicy.DESTROY
    });

    this.addToResourcePolicy(
      new iam.PolicyStatement({
        principals: [new iam.AnyPrincipal()],
        actions: ["s3:Get*"],
        resources: [`arn:aws:s3:::${this.bucketName}/*`],
        effect: iam.Effect.ALLOW,
        conditions: {
          StringEquals: {
            "aws:PrincipalOrgID": orgInfo.orgId,
          },
        },
      })
    );
  }
}