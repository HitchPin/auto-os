import {
  aws_logs as logs,
  aws_s3 as s3,
  aws_iam as iam,
  aws_cloudformation as cfn,
  cloudformation_include as cfnInclude,
  ResolutionTypeHint
} from "aws-cdk-lib";
import { Construct } from "constructs";

interface ResourceProviderRegistrationProps {
  orgBucket: s3.IBucket,
  resourceProviderKey: string,
  providerStackFile: string,
  typeName: string,
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

export class ResourceProviderRegistration extends Construct {

  readonly logRole: iam.Role;
  readonly logGroup: logs.LogGroup;
  constructor(
    parent: Construct,
    name: string,
    props: ResourceProviderRegistrationProps
  ) {
    super(parent, name);

    this.logRole = new iam.Role(this, 'LogRole', {
      roleName: replaceAll(props.typeName, '::', '-') + 'LogRole',
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('resources.cloudformation.amazonaws.com'),
        new iam.ServicePrincipal('hooks.cloudformation.amazonaws.com'),
      ),
      inlinePolicies: {
        'logger': new iam.PolicyDocument({
          statements: [new iam.PolicyStatement({
            actions: [
              "logs:CreateLogGroup",
              "logs:CreateLogStream",
              "logs:DescribeLogGroups",
              "logs:DescribeLogStreams",
              "logs:PutLogEvents",
              "cloudwatch:ListMetrics",
              "cloudwatch:PutMetricData",
            ],
            resources: ['*']
          })]
        })
      }
    })
    this.logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: replaceAll(props.typeName, '::', '-')
    });

    const i = new cfnInclude.CfnInclude(this, "ProviderStack", {
      templateFile: props.providerStackFile,
      preserveLogicalIds: false,
    });

    const provider = new cfn.CfnResourceVersion(this, "Provider", {
      schemaHandlerPackage: props.orgBucket.s3UrlForObject(
        props.resourceProviderKey,
      ),
      loggingConfig: {
        logGroupName: this.logGroup.logGroupName,
        logRoleArn: this.logRole.roleArn
      },
      executionRoleArn: i.getResource('ExecutionRole').getAtt('Arn', ResolutionTypeHint.STRING).toString(),
      typeName: props.typeName,
    });

    new cfn.CfnResourceDefaultVersion(this, "ProviderDefaultVersion", {
      typeVersionArn: provider.ref,
    });

    
  }
}