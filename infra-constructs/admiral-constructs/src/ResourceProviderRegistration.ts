import { aws_s3 as s3, aws_s3_deployment as s3deploy, aws_cloudformation as cfn, cloudformation_include as cfnInclude } from "aws-cdk-lib";
import { Construct } from "constructs";

interface ResourceProviderRegistrationProps {
  orgBucket: s3.IBucket,
  resourceProviderKey: string,
  providerStackFile: string,
  typeName: string,
}

export class ResourceProviderRegistration extends Construct {
  constructor(
    parent: Construct,
    name: string,
    props: ResourceProviderRegistrationProps
  ) {
    super(parent, name);

    const provider = new cfn.CfnResourceVersion(this, "Provider", {
      schemaHandlerPackage: props.orgBucket.s3UrlForObject(
        props.resourceProviderKey
      ),
      typeName: props.typeName,
    });
    
    new cfn.CfnResourceDefaultVersion(this, "ProviderDefaultVersion", {
        typeVersionArn: provider.ref,
    });

    new cfnInclude.CfnInclude(this, "ProviderStack", {
      templateFile: props.providerStackFile,
      preserveLogicalIds: false,
    });
  }
}