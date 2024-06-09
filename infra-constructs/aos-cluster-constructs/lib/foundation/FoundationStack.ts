import * as cdk from "aws-cdk-lib";
import { aws_ssm as ssm } from "aws-cdk-lib";
import { BaseStack } from "../base";
import { fromParams } from "../common";

export class FoundationStack extends BaseStack {
  readonly armParam: ssm.IStringParameter;
  readonly amdParam: ssm.IStringParameter;

  constructor(scope: cdk.App, id: string) {
    super(scope, id);

    const info = fromParams(this);
    const names = info.namesFor(this);

    this.amdParam = new ssm.StringParameter(this, "AmiParam_x86_64", {
      parameterName: names.paramPrefix + "amis/x86_64",
      stringValue: 'ami-0ca2e925753ca2fb4',
      simpleName: false,
      tier: ssm.ParameterTier.INTELLIGENT_TIERING,
      dataType: ssm.ParameterDataType.AWS_EC2_IMAGE
    });
    
    this.armParam = new ssm.StringParameter(this, "AmiParam_arm_64", {
      parameterName: names.paramPrefix + "amis/arm_64",
      stringValue: 'ami-08a04a1d153bf02a7',
      simpleName: false,
      tier: ssm.ParameterTier.INTELLIGENT_TIERING,
      dataType: ssm.ParameterDataType.AWS_EC2_IMAGE,
    });
  }
}
