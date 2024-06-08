import { Construct } from "constructs";
import {
    aws_ec2 as ec2,
    region_info as regions
} from 'aws-cdk-lib';
import * as ami from './ami';
import { IMachineImage } from "aws-cdk-lib/aws-ec2";

export interface IBakedAmi {
  readonly x86_64ImageId: string;
  readonly arm_64ImageId: string;
}

export class BakedAmi extends Construct implements IBakedAmi {
  readonly x86_64ImageId: string;
  readonly arm_64ImageId: string;

  constructor(parent: Construct, name: string) {
    super(parent, name);

    const maestro = new ami.MaestroCliComponent(this, "Maestro");
    const opensearch = new ami.OpenSearchComponent(this, "OpenSearch");

    const vpc = new ec2.Vpc(this, "BakedAmiVpc", {
      maxAzs: 1,
      subnetConfiguration: [
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: "public",
        },
      ],
    });

    const amiBakeryFactory = (arch: ec2.InstanceArchitecture) => {
      return new ami.AmiBakery(this, `Pipeline_${arch}`, {
        name: `Pipeline-${arch}`,
        amiOptions: {
          architecture: arch,
          baseImage: ec2.MachineImage.latestAmazonLinux2023({
            cpuType:
              arch === ec2.InstanceArchitecture.X86_64
                ? ec2.AmazonLinuxCpuType.X86_64
                : ec2.AmazonLinuxCpuType.ARM_64,
          }),
          instanceType:
            arch === ec2.InstanceArchitecture.X86_64
              ? ec2.InstanceType.of(
                  ec2.InstanceClass.C5,
                  ec2.InstanceSize.XLARGE2
                )
              : ec2.InstanceType.of(
                  ec2.InstanceClass.C6G,
                  ec2.InstanceSize.XLARGE2
                ),
        },
        bakingSubnetId: vpc.publicSubnets.at(0)!.subnetId,
        components: [maestro.configProp, opensearch.configProp],
        additionalPolicies: [maestro.policy, opensearch.policy],
      });
    };

    const arm_64 = amiBakeryFactory(ec2.InstanceArchitecture.ARM_64);
    const x86_64 = amiBakeryFactory(ec2.InstanceArchitecture.X86_64);

    this.arm_64ImageId = arm_64.ami;
    this.x86_64ImageId = x86_64.ami;

  }
}