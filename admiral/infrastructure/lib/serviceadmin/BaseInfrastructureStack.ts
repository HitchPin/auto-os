import { Construct } from "constructs";
import {
    aws_route53 as r53,
    aws_events as evts,
    aws_s3 as s3,
    aws_kms as kms
} from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import { OrgSharedBucket } from "../../../../infra-constructs/admiral-constructs/dist";

interface BaseInfrastructureStackProps {
    domainName: string,
    env: cdk.Environment
}

export class BaseInfrastructureStack extends cdk.Stack {

    readonly hostedZone: r53.IPublicHostedZone;
    readonly tenantInbox: evts.EventBus;
    readonly orgAdminInbox: evts.EventBus;
    readonly orgAssetsBucket: s3.IBucket;
    readonly assetsBucketName: string;
    readonly encryptionKey: kms.IKey;

    constructor(parent: Construct, name: string, props: BaseInfrastructureStackProps) {
        super(parent, name, { env: props.env });
        
        this.hostedZone = new r53.HostedZone(this, 'HostedZone', {
            zoneName: props.domainName
        });

        this.orgAdminInbox = new evts.EventBus(this, 'OrgAdminBus', {
            eventBusName: 'admiral-sysadmin-events'
        });
        this.tenantInbox = new evts.EventBus(this, 'TenantInboxBus', {
            eventBusName: 'tenant-inbox'
        });

        this.assetsBucketName ='hp-auto-os-orgwide-product-assets';
        this.orgAssetsBucket = new OrgSharedBucket(this, 'OrgBucket', {
            bucketName: this.assetsBucketName
        });
        this.encryptionKey = this.orgAssetsBucket.encryptionKey!;
    }
}