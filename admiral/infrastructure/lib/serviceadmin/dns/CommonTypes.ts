import { aws_route53 as r53 } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface IDomainInfo {
    zone: r53.IPublicHostedZone
}
export interface IAccountFactoryZone {
    bind: (c: Construct) => IDomainInfo;
}