import { aws_events as evts, aws_events_targets as targets, aws_iam as iam, Stack, Environment } from 'aws-cdk-lib';
import { Construct } from "constructs";

interface EventingStackProps {
    svcAdminEventBus: evts.EventBus,
    serviceAdminAccountId: string,
    env: Environment
}

export class EventingStack extends Stack {

    readonly fleetwideEventBus: evts.EventBus;

    constructor(parent: Construct, name: string, props: EventingStackProps) {
        super(parent, name, { env: props.env });


        const tenantEmailRule = new evts.Rule(this, 'Tenant Email Rule', {
            ruleName: 'forward-tenant-email-events',
            eventBus: this.fleetwideEventBus,
            enabled: true,
            eventPattern: {
                source: ['admiral.tenant-mailbox']
            }
        });
        tenantEmailRule.addTarget(new targets.EventBus(props.svcAdminEventBus))
    }
}