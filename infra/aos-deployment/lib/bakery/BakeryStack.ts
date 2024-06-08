import * as cdk from "aws-cdk-lib";
import {
    aws_ssm as ssm
} from 'aws-cdk-lib';
import * as aosInternal from "../../../aos-cdk-internal/dist";
import * as ephemeral from "@aws-community/ephemeral";

interface BakeryStackProps {
    armParam: ssm.IStringParameter,
    amdParam: ssm.IStringParameter
}

export class BakeryStack extends ephemeral.SelfDestructStack {

  constructor(scope: cdk.App, id: string, p: BakeryStackProps) {
    super(scope, id, {
      selfDestructionDuration: cdk.Duration.minutes(30),
      selfDestructionEnable: true,
    });

    new cdk.CfnParameter(this, "ClusterDnsRoot", {});
    new cdk.CfnParameter(this, "ClusterName", {});
    new cdk.CfnParameter(this, "ClusterId");

    const ami = new aosInternal.BakedAmi(this, "Ami");

    new aosInternal.ParamLink(this, "ArmLink", {
      stringParam: p.armParam,
      amiId: ami.arm_64ImageId,
    });
    new aosInternal.ParamLink(this, "AmdLink", {
      stringParam: p.amdParam,
      amiId: ami.x86_64ImageId,
    });
  }
}