import { aws_events as evts } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import * as admiralConstructs from "../../../../infra-constructs/admiral-constructs/dist";
import * as sss from './stacksets';
import * as product from './product';

interface RegistrarStackProps {
    managedAccountsOuId: string,
    env: cdk.Environment,
    tenantEventBus: evts.EventBus
}

export class RegistrarStack extends cdk.Stack {
  readonly fleet: admiralConstructs.AdmiralFleet;

  readonly customProviderStack: sss.CustomProvidersStack 
  readonly localEventsStack: sss.CustomProvidersStack;

  constructor(parent: cdk.App, name: string, props: RegistrarStackProps) {
    super(parent, name, props);

    const orgBucket = new admiralConstructs.OrgSharedBucket(this, "OrgBucket", {
      bucketName: `hp-autoos-orgwide-cfn-resource-provider-assets`,
    });

    this.customProviderStack = new sss.CustomProvidersStack(this, 'Providers', {
      regions: ['us-east-2'],
      orgBucket: orgBucket,
      managedAccountsOuId: props.managedAccountsOuId,
    });
    this.localEventsStack = new sss.LocalEventsStack(this, 'Events', {
      regions: ['us-east-2'],
      sourceEventBus: props.tenantEventBus,
      managedAccountsOuId: props.managedAccountsOuId,
    });
  }
}
