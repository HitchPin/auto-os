import { Construct } from "constructs";
import {
    aws_route53 as r53,
    aws_events as evts
} from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import * as dns from './dns';
import * as admiralConstructs from "../../../../infra-constructs/admiral-constructs/dist";

interface AccountFactoryStackProps {
    dnsZone: dns.IAccountFactoryZone,
    tenantMailDomain: string,
    env: cdk.Environment,
    tenantEventBus: evts.EventBus
}

export class AccountFactoryStack extends cdk.Stack {

    private readonly hostedZone: r53.IPublicHostedZone;
    private readonly mailbox: admiralConstructs.FleetMailbox;

    constructor(parent: Construct, name: string, props: AccountFactoryStackProps) {
        super(parent, name, { env: props.env });
        
        const zone = props.dnsZone.bind(this);
        this.hostedZone = zone.zone;

        this.mailbox = new admiralConstructs.FleetMailbox(this, 'FleetMailbox', {
            zone: this.hostedZone,
            domainName: props.tenantMailDomain,
            admiralEventBus: props.tenantEventBus
        });
    }
}