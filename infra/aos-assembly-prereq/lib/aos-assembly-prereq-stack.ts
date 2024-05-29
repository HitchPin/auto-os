import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SixyVpc } from './SixyVpc';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
export class AosAssemblyPrereqStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new SixyVpc(this, 'Vpc', {
      maxAzs: 3,
      keepIpv4: true
    });
    const sg = new ec2.SecurityGroup(this, 'AutoOsSg', {
      allowAllOutbound: true,
      allowAllIpv6Outbound: true,
      vpc: vpc.vpc
    });
    sg.addIngressRule(ec2.Peer.ipv4(vpc.vpc.vpcCidrBlock), ec2.Port.tcpRange(9200, 9700));
  }
}
