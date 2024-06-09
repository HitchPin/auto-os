import { aws_ecr as ecr, aws_iam as iam } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as aosInternal from "../../aos-internal-constructs/dist";

type OrgSharedDockerRepoProps = ecr.RepositoryProps;

export class OrgSharedDockerRepo extends ecr.Repository {
  constructor(
    parent: Construct,
    name: string,
    props: OrgSharedDockerRepoProps
  ) {
    const orgInfo = aosInternal.OrgMembershipLookup.from(parent, true);
    super(parent, name, props);

    this.addToResourcePolicy(
      new iam.PolicyStatement({
        principals: [new iam.AnyPrincipal()],
        actions: [
            "ecr:BatchCheckLayerAvailability",
            "ecr:BatchGetImage",
            "ecr:DescribeImages",
            "ecr:DescribeRepositories",
            "ecr:GetDownloadUrlForLayer"
        ],
        effect: iam.Effect.ALLOW,
        conditions: {
          'ForAnyValue:StringLike': {
            'aws:PrincipalOrgPaths': `${orgInfo.orgId}/*`
          }
        }
      }),
    );
  }
}
