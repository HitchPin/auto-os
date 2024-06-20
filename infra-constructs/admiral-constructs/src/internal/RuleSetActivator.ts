import { aws_ses as ses, aws_iam as iam, aws_lambda as lambda, custom_resources as cr, CustomResource } from "aws-cdk-lib";
import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";

interface RuleSetActivatorProps {
    rs: ses.IReceiptRuleSet
}

export class RuleSetActivator extends Construct {

  constructor(parent: Construct, name: string, props: RuleSetActivatorProps) {
    super(parent, name);

    new cr.AwsCustomResource(this, 'RuleSetActivator', {
        onUpdate: { // will also be called for a CREATE event
          service: 'SES',
          action: 'SetActiveReceiptRuleSet',
          parameters: {
            RuleSetName: props.rs.receiptRuleSetName
          },
          physicalResourceId: cr.PhysicalResourceId.of(props.rs.receiptRuleSetName),
        },
        policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
          resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
      });
  }
}