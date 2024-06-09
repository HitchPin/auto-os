import {
  aws_autoscaling as asg,
  aws_ec2 as ec2,
  aws_elasticloadbalancingv2 as elb,
  aws_elasticloadbalancingv2_targets as elbTargets,
  aws_certificatemanager as acm,
  Tags,
} from "aws-cdk-lib";
import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { ClusterAsg } from "./ClusterAsg";
import { fromParams } from "../common";
import * as aosInternal from '../../../aos-internal-constructs/dist';

interface ClusterLbProps {
  vpc: ec2.IVpc;
  rootCa: aosInternal.IRootCA;
  subnets: ec2.SubnetSelection;
}

export class ClusterLb extends Construct {

    private readonly targetGroup: elb.ApplicationTargetGroup;
    readonly lb: elb.ApplicationLoadBalancer;
    readonly listener: elb.ApplicationListener;

  constructor(parent: Construct, name: string, props: ClusterLbProps) {
    super(parent, name);

    const info = fromParams(this);
    const names = info.namesFor(this);
    
    const lbCert = new aosInternal.LoadBalancerCertificate(this, 'LbCert', {
      rootCA: props.rootCa,
      commonName: info.dnsRoot,
    });

    const sg = new ec2.SecurityGroup(this, 'LbSg', {
        vpc: props.vpc
    });
    sg.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcp(443)
    );
    
    const lb = new elb.ApplicationLoadBalancer(this, "Lb", {
      loadBalancerName: `${info.name}-${info.id}`,
      vpc: props.vpc,
      vpcSubnets: props.subnets,
      securityGroup: sg,
      ipAddressType: elb.IpAddressType.IPV4,
    });

    const tg = new elb.ApplicationTargetGroup(this, "TargetGroup", {
      targetGroupName: `${info.name}-${info.id}`,
      targetType: elb.TargetType.INSTANCE,
      vpc: props.vpc,
      port: 9200,
      protocol: elb.ApplicationProtocol.HTTPS,
      healthCheck: {
        path: "/_cluster/health",
      },
      deregistrationDelay: cdk.Duration.minutes(1),
    });

    const listener = new elb.ApplicationListener(this, "Listener", {
      port: 443,
      protocol: elb.ApplicationProtocol.HTTPS,
      defaultTargetGroups: [tg],
      loadBalancer: lb,
      certificates: [elb.ListenerCertificate.fromCertificateManager(lbCert.certificate)],
    });

  
    this.lb = lb;
    this.targetGroup = tg;
    this.listener = listener;
  }

  registerAsg(clusterAsg: ClusterAsg) {
    this.targetGroup.addTarget(clusterAsg.autoScalingGroup);
  }
}
