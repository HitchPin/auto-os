import {
    aws_kms as kms,
    aws_iam as iam,
    RemovalPolicy
} from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as aosInternal from "../../aos-internal-constructs/dist";

type OrgSharedKmsKeyProps = kms.KeyProps;

export class OrgSharedKmsKey extends kms.Key {
  constructor(parent: Construct, name: string, props: OrgSharedKmsKeyProps) {
    const orgInfo = aosInternal.OrgMembershipLookup.from(parent, true);
    super(parent, name, {
        ...props
    });

    this.addToResourcePolicy(
      new iam.PolicyStatement({
        principals: [new iam.AnyPrincipal()],
        actions: ["kms:Decrypt", "kms:GenerateDataKey"],
        resources: [
          `*`
        ],
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