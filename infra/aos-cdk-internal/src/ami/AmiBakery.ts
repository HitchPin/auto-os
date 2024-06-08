import { Construct } from "constructs";
import { ImagePipeline }from './CdkImagePipeline';
import {
  aws_iam as iam,
  aws_ec2 as ec2,
  aws_s3 as s3,
  aws_imagebuilder as imgb,
  RemovalPolicy,
} from "aws-cdk-lib";

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
  additionalPolicies: iam.PolicyStatement[]
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

    this.pipeline = new ImagePipeline(this, "AmiBakery", {
      imageRecipeRootName: props.name,
      instanceTypes: [props.amiOptions.instanceType.toString()],
      components: props.components,
      parentImage: ami.imageId,
      ebsVolumeConfigurations: [
        {
          deviceName: "/dev/xvda",
          ebs: {
            encrypted: true,
            volumeSize: 64,
            volumeType: "gp3",
          },
        },
      ],
      subnetId: props.bakingSubnetId,
      enableCrossAccountDistribution: false,
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