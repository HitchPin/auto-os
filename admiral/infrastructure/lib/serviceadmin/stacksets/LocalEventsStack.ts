import {
    aws_servicecatalog as svcCat,
    aws_iam as iam,
    aws_kms as kms,
    aws_events as evts
} from "aws-cdk-lib";
  import * as cdk from 'aws-cdk-lib';
  import { Construct } from "constructs";
  import * as ss from 'cdk-stacksets';

  interface LocalEventsStackProps {
    managedAccountsOuId: string,
    regions: string[],
    sourceEventBus: evts.EventBus
  }
  export class LocalEventsStack extends ss.StackSet {
  
    constructor(parent: Construct, name: string, props: LocalEventsStackProps) {
      super(parent, name, {
        target: ss.StackSetTarget.fromOrganizationalUnits({
          regions: props.regions,
          organizationalUnits: [props.managedAccountsOuId],
        }),
        deploymentType: ss.DeploymentType.serviceManaged({
          autoDeployEnabled: true,
          autoDeployRetainStacks: false,
        }),
        template: ss.StackSetTemplate.fromStackSetStack(createLocalEventsStackSet(parent, {
            sourceEventBus: props.sourceEventBus,
          })),
        capabilities: [ss.Capability.IAM, ss.Capability.NAMED_IAM]
      });
    }
  }
  
interface LocalEventsArgs {
    sourceEventBus: evts.EventBus
}

const createLocalEventsStackSet = (parent: Construct, args: LocalEventsArgs): ss.StackSetStack => {
    const providerStack = new ss.StackSetStack(parent, "LocalEventsStack", {
    });
    
    const localBus = new evts.EventBus(providerStack, 'LocalEvents', {
        eventBusName: 'local-admiral-events',
    });
    const sourceArn = args.sourceEventBus.eventBusArn;
    const accountId = cdk.Fn.split(':', sourceArn)[4];
    localBus.grantPutEventsTo( new iam.AccountPrincipal(cdk.Token.asString(accountId)));

    
    return providerStack;
}

export { createLocalEventsStackSet };