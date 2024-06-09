import { aws_s3 as s3 } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ss from 'cdk-stacksets';
import * as admiralConstructs from "../../../../infra-constructs/admiral-constructs/dist";

interface RegistrarStackProps {
    managedAccountsOuId: string,
    env: cdk.Environment
}

export class RegistrarStack extends cdk.Stack {
  readonly fleet: admiralConstructs.AdmiralFleet;

  constructor(parent: cdk.App, name: string, props: RegistrarStackProps) {
    super(parent, name, props);

    const orgBucket = new admiralConstructs.OrgSharedBucket(this, "OrgBucket", {
      bucketName: `hp-autoos-orgwide-cfn-resource-provider-assets`,
    });

    const rootCaSource = new admiralConstructs.ResourceProviderUploader(this, 'RootCa', {
        resourceProvider: 'rootca-cfn-resource',
        orgBucket: orgBucket
    })

    const lbCertSource = new admiralConstructs.ResourceProviderUploader(
      this,
      "LbCert",
      {
        resourceProvider: "lbcert-cfn-resource",
        orgBucket: orgBucket,
      }
    );

    const providerStack = new ss.StackSetStack(this, "Providers", {
    });
    new admiralConstructs.ResourceProviderRegistration(
      providerStack,
      "RootCA",
      {
        orgBucket: orgBucket,
        resourceProviderKey: rootCaSource.handlerKey,
        providerStackFile: rootCaSource.stackFile,
        typeName: "HitchPin::AutoOs::RootCA",
      }
    );
    new admiralConstructs.ResourceProviderRegistration(
      providerStack,
      "LbCert",
      {
        orgBucket: orgBucket,
        resourceProviderKey: lbCertSource.handlerKey,
        providerStackFile: lbCertSource.stackFile,
        typeName: "HitchPin::AutoOs::LbCertificate"
      }
    );

    new ss.StackSet(this, "ResourcesStackSet", {
      target: ss.StackSetTarget.fromOrganizationalUnits({
        regions: ["us-east-2"],
        organizationalUnits: [props.managedAccountsOuId],
      }),
      deploymentType: ss.DeploymentType.serviceManaged({
        autoDeployEnabled: true,
        autoDeployRetainStacks: false,
      }),
      template: ss.StackSetTemplate.fromStackSetStack(providerStack),
      capabilities: [ss.Capability.IAM, ss.Capability.NAMED_IAM]
    });
  }
}
