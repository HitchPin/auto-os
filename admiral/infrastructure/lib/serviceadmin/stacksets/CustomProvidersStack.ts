import {
    aws_s3 as s3,
    aws_servicecatalog as svcCat,
    aws_iam as iam,
    aws_kms as kms,
    aws_events as evts,
    CfnStackSet
} from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as ss from 'cdk-stacksets';
import * as admiralConstructs from "../../../../../infra-constructs/admiral-constructs/dist";
import { CfnCustomResource, CfnStack } from 'aws-cdk-lib/aws-cloudformation';

interface CustomProvidersStackProps {
  managedAccountsOuId: string,
  regions: string[],
  orgBucket: s3.IBucket
}

export class CustomProvidersStack extends ss.StackSet {

  constructor(parent: Construct, name: string, props: CustomProvidersStackProps) {
    const caSrc = new admiralConstructs.ResourceProviderUploader(parent, 'RootCa', {
      resourceProvider: 'rootca-cfn-resource',
      orgBucket: props.orgBucket,
    });
    const lbSrc = new admiralConstructs.ResourceProviderUploader(
      parent,
      "LbCert",
      {
        resourceProvider: "lbcert-cfn-resource",
        orgBucket: props.orgBucket,
      }
    );
    const stackSetStack = createCustomProvidersStackSet(parent, {
      orgBucket: props.orgBucket,
      rootCa: {
          resourceProviderKey: caSrc.handlerKey,
          providerStackFile: caSrc.stackFile,
      },
      lbCert: {
        resourceProviderKey: lbSrc.handlerKey,
        providerStackFile: lbSrc.stackFile
      }
    });
    super(parent, name, {
      target: ss.StackSetTarget.fromOrganizationalUnits({
        regions: props.regions,
        organizationalUnits: [props.managedAccountsOuId],
      }),
      deploymentType: ss.DeploymentType.serviceManaged({
        autoDeployEnabled: true,
        autoDeployRetainStacks: false,
      }),
      template: ss.StackSetTemplate.fromStackSetStack(stackSetStack),
      capabilities: [ss.Capability.IAM, ss.Capability.NAMED_IAM]
    });

    const rForSrc = (src: admiralConstructs.ResourceProviderUploader) => {
      const c = src.node.children.find(ch => {
        console.log(ch);
      });
    }
    
   //throw new Error(`CASRC: ${rForSrc(caSrc)}`);
    this.node.addDependency(caSrc.deployment);
    this.node.addDependency(lbSrc.deployment);
    
  }
}

interface ResourceProviderSource {
    resourceProviderKey: string,
    providerStackFile: string
}
interface CustomProviderArgs {
    orgBucket: s3.IBucket,
    rootCa: ResourceProviderSource,
    lbCert: ResourceProviderSource
}

const createCustomProvidersStackSet = (parent: Construct, args: CustomProviderArgs): ss.StackSetStack => {
  
    const providerStack = new ss.StackSetStack(parent, "ProvidersStack", {
    });
    new admiralConstructs.ResourceProviderRegistration(
      providerStack,
      "RootCA",
      {
        orgBucket: args.orgBucket,
        resourceProviderKey: args.rootCa.resourceProviderKey,
        providerStackFile: args.rootCa.providerStackFile,
        typeName: "HitchPin::AutoOs::RootCA",
      }
    );
    new admiralConstructs.ResourceProviderRegistration(
      providerStack,
      "LbCert",
      {
        orgBucket: args.orgBucket,
        resourceProviderKey: args.lbCert.resourceProviderKey,
        providerStackFile: args.lbCert.providerStackFile,
        typeName: "HitchPin::AutoOs::LbCertificate"
      }
    );
    return providerStack;
}