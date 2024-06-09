import {
  aws_iam as iam,
} from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class FiefdomPrereqs extends Construct {
  constructor(parent: Construct, name: string) {
    super(parent, name);

    new iam.Role(this, "AWSControlTowerAdmin", {
      roleName: "AWSControlTowerAdmin",
      assumedBy: new iam.ServicePrincipal("controltower.amazonaws.com"),
      path: "/service-role/",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSControlTowerServiceRolePolicy"
        ),
      ],
      inlinePolicies: {
        azDescriber: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["ec2:DescribeAvailabilityZones"],
              resources: ["*"],
            }),
          ],
        }),
      },
    });
    new iam.Role(this, "AWSControlTowerCloudTrailRole", {
      roleName: "AWSControlTowerCloudTrailRole",
      assumedBy: new iam.ServicePrincipal("cloudtrail.amazonaws.com"),
      path: "/service-role/",
      inlinePolicies: {
        logPutter: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["logs:PutLogEvents", "logs:CreateLogStream"],
              resources: [
                `arn:${cdk.Aws.PARTITION}:logs:*:*:log-group:aws-controltower/CloudTrailLogs:*`,
              ],
            }),
          ],
        }),
      },
    });

    new iam.Role(this, "AWSControlTowerConfigAggregatorRoleForOrganizations", {
      roleName: "AWSControlTowerConfigAggregatorRoleForOrganizations",
      assumedBy: new iam.ServicePrincipal("config.amazonaws.com"),
      path: "/service-role/",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSConfigRoleForOrganizations"
        ),
      ],
    });

    new iam.Role(this, "AWSControlTowerStackSetRole", {
      roleName: "AWSControlTowerStackSetRole",
      assumedBy: new iam.ServicePrincipal("cloudformation.amazonaws.com"),
      path: "/service-role/",
      inlinePolicies: {
        roleAssumer: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["sts:AssumeRole"],
              resources: [
                `arn:${cdk.Aws.PARTITION}:iam::*:role/AWSControlTowerExecution`,
              ],
            }),
          ],
        }),
      },
    });
  }
}
