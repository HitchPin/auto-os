import { 
    aws_elasticloadbalancingv2 as elb2,
    aws_elasticloadbalancingv2_targets as tgt,
    aws_ec2 as ec2,
 } from "aws-cdk-lib";
import { Construct } from "constructs";
import { fromParams } from "../common";

interface ServiceNlbProps {
    vpc: ec2.IVpc,
    esAlb: elb2.IApplicationLoadBalancer
}

export class ServiceNlb extends Construct {

    readonly nlb: elb2.NetworkLoadBalancer;
    readonly targetGroup: elb2.NetworkTargetGroup;
    readonly listener: elb2.NetworkListener;

  constructor(parent: Construct, name: string, p: ServiceNlbProps) {
    super(parent, name);

    const info = fromParams(this);
    const names = info.namesFor(this);

    this.nlb = new elb2.NetworkLoadBalancer(this, 'Nlb', {
        ipAddressType: elb2.IpAddressType.DUAL_STACK,
        vpc: p.vpc,
    });
    this.listener = this.nlb.addListener('listener', { port: 443 });
    this.targetGroup = this.listener.addTargets('target', {
        port: 443,
        targets: [new tgt.AlbTarget(p.esAlb, 443) ]
    });
  }
}
