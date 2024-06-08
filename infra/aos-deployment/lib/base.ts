import * as cdk from 'aws-cdk-lib';
import * as aosInternal from "../../aos-cdk-internal/dist";

export abstract class BaseStack extends cdk.Stack {
  readonly dnsRootParam: cdk.CfnParameter;
  readonly nameParam: cdk.CfnParameter;
  readonly idParam: cdk.CfnParameter;
  readonly stringMacroName: string;

  constructor(parent: cdk.App, name: string) {
    super(parent, name, {});

    this.dnsRootParam = new cdk.CfnParameter(this, "ClusterDnsRoot", {});
    this.nameParam = new cdk.CfnParameter(this, "ClusterName", {});
    this.idParam = new cdk.CfnParameter(this, "ClusterId");
  }
}