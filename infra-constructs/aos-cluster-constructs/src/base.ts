import * as cdk from 'aws-cdk-lib';
import {
  aws_servicecatalog as svcCat
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface BaseNestedStackProps {
  dnsRoot: string,
  clusterName: string,
  clusterId: string
}

export abstract class BaseNestedStack extends cdk.NestedStack {
  readonly dnsRootParam: cdk.CfnParameter;
  readonly nameParam: cdk.CfnParameter;
  readonly idParam: cdk.CfnParameter;
  readonly stringMacroName: string;

  constructor(parent: Construct, name: string, props: BaseNestedStackProps) {
    super(parent, name, {
      parameters: {
        'ClusterDnsRoot': props.dnsRoot,
        'ClusterName': props.clusterName,
        'ClusterId': props.clusterId
      }
    });

    this.dnsRootParam = new cdk.CfnParameter(this, "ClusterDnsRoot", {});
    this.nameParam = new cdk.CfnParameter(this, "ClusterName", {});
    this.idParam = new cdk.CfnParameter(this, "ClusterId");
  }
}

interface BaseStackProps extends svcCat.ProductStackProps {}

export abstract class BaseStack extends svcCat.ProductStack {
  readonly dnsRootParam: cdk.CfnParameter;
  readonly nameParam: cdk.CfnParameter;
  readonly idParam: cdk.CfnParameter;
  readonly stringMacroName: string;

  constructor(parent: Construct, name: string, props: BaseStackProps) {
    super(parent, name, props);

    this.dnsRootParam = new cdk.CfnParameter(this, "ClusterDnsRoot", {});
    this.nameParam = new cdk.CfnParameter(this, "ClusterName", {});
    this.idParam = new cdk.CfnParameter(this, "ClusterId");
  }
}