import { Construct } from "constructs";
import {
    aws_certificatemanager as acm
} from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import * as dns from './dns';
import * as admiralConstructs from "../../../../infra-constructs/admiral-constructs/dist";

interface ApiStackProps {
    dnsZone: dns.IAccountFactoryZone,
    env: cdk.Environment,
    accountEmailDomainName: string,
    orgRootId: string,
    destinationOuId: string,
    orgRoleArn: string
}

export class ApiStack extends cdk.Stack {

    private readonly api: admiralConstructs.AdmiralApi;

    constructor(parent: Construct, name: string, props: ApiStackProps) {
        super(parent, name, { env: props.env, crossRegionReferences: true });
        
        const zone = props.dnsZone.bind(this);
        this.api = new admiralConstructs.AdmiralApi(this, 'Api', {
            zone: zone.zone,
            accountEmailDomainName: props.accountEmailDomainName,
            orgRootId: props.orgRootId,
            destinationOuId: props.destinationOuId,
            orgRoleArn: props.orgRoleArn
        })
    }
}