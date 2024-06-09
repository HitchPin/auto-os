import * as cdk from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { ISubnet } from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export interface SixyVpcProps {
  vpcName?: string;
  maxAzs?: number;
  keepIpv4: boolean;
}

export class SixyVpc extends Construct {

    readonly vpc: ec2.Vpc;
  constructor(parent: Construct, name: string, props: SixyVpcProps) {
    super(parent, name);

    const V4 = props.keepIpv4;

    const subnetConfig: ec2.SubnetConfiguration[] = [
      {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        name: "private",
      },
    ];

    // V4 requires nat gateways to live in public subnets
    if (V4) {
      subnetConfig.push({
        subnetType: ec2.SubnetType.PUBLIC,
        name: "public",
      });
    }

    const v = new ec2.Vpc(this, "Vpc", {
      vpcName: props.vpcName,
      maxAzs: props.maxAzs,
      natGateways: V4 ? undefined : 0,
      subnetConfiguration: subnetConfig
    });

    const v6CidrBlock = new ec2.CfnVPCCidrBlock(this, "V6CidrBlock", {
      vpcId: v.vpcId,
      amazonProvidedIpv6CidrBlock: true,
    });

    const subnets: ec2.ISubnet[] = [
      ...v.publicSubnets,
      ...v.privateSubnets,
      ...v.isolatedSubnets,
    ];

    const vpcV6Cidrs = cdk.Fn.select(0, v.vpcIpv6CidrBlocks);
    const subnetV6Cidrs = cdk.Fn.cidr(vpcV6Cidrs, 256, `${128 - 64}`);

    subnets.forEach((subnet, i) => {
      const cidr6 = cdk.Fn.select(i, subnetV6Cidrs);
      const subNode = subnet.node.defaultChild as ec2.CfnSubnet;
      subNode.ipv6CidrBlock = cidr6;
      subNode.addDependency(v6CidrBlock);
    });

    const convertToPureIpV6Subnet = (s: ISubnet) => {
      const cfnSubnet = s.node.defaultChild as ec2.CfnSubnet;
      cfnSubnet.ipv6Native = !V4;
      cfnSubnet.assignIpv6AddressOnCreation = true;
      cfnSubnet.privateDnsNameOptionsOnLaunch = {
        EnableResourceNameDnsAAAARecord: true,
        EnableResourceNameDnsARecord: V4,
        HostnameType: "resource-name",
      };
      cfnSubnet.enableDns64 = true;
      if (!V4) {
        cfnSubnet.addDeletionOverride("Properties.CidrBlock");
      }
    };

    if (v.publicSubnets) {
      const igwId = v.internetGatewayId;
      v.publicSubnets.forEach((subnet) => {
        (subnet as ec2.Subnet).addRoute("DefaultRoute6", {
          routerType: ec2.RouterType.GATEWAY,
          routerId: igwId!,
          destinationIpv6CidrBlock: "::/0",
          enablesInternetConnectivity: true,
        });
        convertToPureIpV6Subnet(subnet);
      });
    }
    if (v.privateSubnets) {
      const eigw = new ec2.CfnEgressOnlyInternetGateway(this, "eigw6", {
        vpcId: v.vpcId,
      });

      v.privateSubnets.forEach((s) => {
        const subnet = s as ec2.Subnet;
        subnet.addRoute("DefaultRoute6", {
          routerType: ec2.RouterType.EGRESS_ONLY_INTERNET_GATEWAY,
          routerId: eigw.attrId,
          destinationIpv6CidrBlock: "::/0",
          enablesInternetConnectivity: true,
        });
        convertToPureIpV6Subnet(subnet);
      });
    }
    this.vpc = v;
  }
}
