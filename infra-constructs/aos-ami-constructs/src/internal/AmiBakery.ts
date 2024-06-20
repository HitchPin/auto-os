import { Construct } from "constructs";
import { ImagePipeline, OrganizationSharingProps }from './CdkImagePipeline';
import {
  aws_iam as iam,
  aws_ec2 as ec2,
  aws_kms as kms,
  aws_imagebuilder as imgb,
  RemovalPolicy,
} from "aws-cdk-lib";
import { OrgMembershipLookup } from '../../../aos-internal-constructs/dist'

interface AmiOptions {
  baseImage: ec2.MachineImage;
  instanceType: ec2.InstanceType;
  architecture: ec2.InstanceArchitecture
}

interface AmiBakeryProps {
  name: string;
  bakingSubnetId: string;
  amiOptions: AmiOptions;
  components: imgb.CfnImageRecipe.ComponentConfigurationProperty[],
  additionalPolicies: iam.PolicyStatement[];
  shareWithOrg: boolean;
  encryptionKey: kms.IKey
}

export class AmiBakery extends Construct {
  readonly pipeline: ImagePipeline;
  readonly image: imgb.CfnImage;
  readonly ami: string;

  constructor(parent: Construct, name: string, props: AmiBakeryProps) {
    super(parent, name);
    
    /*
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      `mkdir /etc/maestro`,
      `echo 'ApiEndpoint: "${props.maestroEndpoint}/"' >> /etc/maestro/config.yml`,
      `echo 'AwsRegion: "${cdk.Aws.REGION}"' >> /etc/maestro/config.yml`
    );
    */

    const ami = (props.amiOptions.baseImage as ec2.IMachineImage).getImage(this);

    let orgSharing: OrganizationSharingProps | undefined = undefined;
    if (props.shareWithOrg) {
      const orgLookup = OrgMembershipLookup.from(this, true);
      orgSharing = {
        orgArn: orgLookup.orgArn
      };
    }
    this.pipeline = new ImagePipeline(this, "AmiBakery", {
      imageRecipeRootName: props.name,
      instanceTypes: [props.amiOptions.instanceType.toString()],
      components: props.components,
      parentImage: ami.imageId,
      distributionRegions: ['us-east-2'],
      ebsVolumeConfigurations: [
        {
          deviceName: "/dev/xvda",
          ebs: {
            encrypted: true,
            kmsKeyId: props.encryptionKey.keyId,
            volumeSize: 64,
            volumeType: "gp3",
          },
        },
      ],
      subnetId: props.bakingSubnetId,
      organizationSharing: orgSharing,
      additionalPolicies: [
        new iam.ManagedPolicy(this, "Storage", {
          statements: props.additionalPolicies,
        }),
      ],
    });
    this.pipeline.pipeline.name = `${props.name}-${props.amiOptions.architecture}`;

    this.image = new imgb.CfnImage(this, "Image", {
      imageRecipeArn: this.pipeline.recipe.attrArn,
      infrastructureConfigurationArn: this.pipeline.infraConfig.attrArn,
      enhancedImageMetadataEnabled: true,
    });
    this.image.applyRemovalPolicy(RemovalPolicy.RETAIN);
    this.ami = this.image.attrImageId;
  }
}