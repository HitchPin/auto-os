import * as cdk from "aws-cdk-lib";
import {
    aws_ec2 as ec2,
  aws_elasticloadbalancingv2 as elb2,
} from "aws-cdk-lib";
import { Construct } from 'constructs';
import { fromParams } from "../common";
import { BaseNestedStack, BaseNestedStackProps } from "../base";
import { ServiceNlb } from './ServiceNlb';
import { RegisteredTenant} from "../../../aos-internal-constructs/dist";

interface EndpointStackProps extends BaseNestedStackProps {
    vpc: ec2.Vpc,
    alb: elb2.IApplicationLoadBalancer,
}

export class EndpointStack extends BaseNestedStack {

  readonly svc: ec2.VpcEndpointService;
  
  get serviceId(): string {
    return this.svc.vpcEndpointServiceId;
  }

  constructor(scope: Construct, id: string, props: EndpointStackProps) {
    super(scope, id, props);

    const info = fromParams(this);
    const names = info.namesFor(this);

    const lb = new ServiceNlb(this, 'Nlb', {
        vpc: props.vpc,
        esAlb: props.alb
    });

    new ec2.VpcEndpointService(this, 'EndpointService', {
        vpcEndpointServiceLoadBalancers: [lb.nlb],
        acceptanceRequired: true,
        allowedPrincipals: [RegisteredTenant.of(this).accountPrincipal],
        contributorInsights: true
    });
  }
}
