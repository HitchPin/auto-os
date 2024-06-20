import {
    aws_s3 as s3,
    aws_iam as iam,
    aws_ssm as ssm,
} from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";

interface TenantRegistrationBeaconProps {
    accountId: string,
    registeredName: string
}

export class TenantRegistrationBeacon extends Construct {
  constructor(parent: Construct, name: string, props: TenantRegistrationBeaconProps) {
    super(parent, name);

    const s = cdk.Stack.of(this);
    new cdk.CfnOutput(s, 'TenantRegistration_RegisteredName', {
        value: props.registeredName,
        exportName: 'TenantRegistration_RegisteredName'
    });
    new cdk.CfnOutput(s, 'TenantRegistration_AccountId', {
        value: props.accountId,
        exportName: 'TenantRegistration_AccountId'
    });
    
    new ssm.StringParameter(this, 'RegisteredNameParam', {
        parameterName: '/admiral/tenant/registeredName',
        stringValue: props.registeredName,
        simpleName: false,
    });
    new ssm.StringParameter(this, 'AccountIdParam', {
        parameterName: '/admiral/tenant/accountId',
        stringValue: props.accountId,
        simpleName: false,
    });
  }
}