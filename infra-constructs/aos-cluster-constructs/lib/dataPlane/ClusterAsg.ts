import {
  aws_ec2 as ec2, aws_iam as iam, aws_autoscaling as asg, Tags } from "aws-cdk-lib";
import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as setup from './setup';
import type { ClusterRoleType } from "./Types";
import { fromParams } from "../common";

interface ClusterAsgProps {
  vpc: ec2.IVpc;
  subnets: ec2.SubnetSelection;
  securityGroup: ec2.SecurityGroup;
  instanceRole: iam.Role;
  ami: ec2.IMachineImage;
  instanceType: ec2.InstanceType;
  maestroEndpoint: string;
  clusterRole: ClusterRoleType;
  capacityUpperBound: number;
  immuneFromLbHealthChecks?: boolean;
}

export class ClusterAsg extends Construct {

  readonly autoScalingGroup: asg.AutoScalingGroup;

  constructor(parent: Construct, name: string, props: ClusterAsgProps) {
    super(parent, name);

    const info = fromParams(this);
    const names = info.namesFor(this);

    const ud = new setup.SetupUserData(this, "UDE", {
      maestroApiEndpoint: props.maestroEndpoint,
      clusterRole: props.clusterRole,
    }).userData;

    const bootstrapTemplate = new ec2.LaunchTemplate(this, "Template", {
      instanceMetadataTags: true,
      launchTemplateName: names.hyphenatedPrefix + `${props.clusterRole}`,
      securityGroup: props.securityGroup,
      machineImage: props.ami,
      instanceType: props.instanceType,
      role: props.instanceRole,
      httpProtocolIpv6: true,
      userData: ud,
      requireImdsv2: true,
      blockDevices: [
        {
          deviceName: "/dev/xvda",
          volume: ec2.BlockDeviceVolume.ebs(64, {}),
        },
      ],
    });

    this.autoScalingGroup = new asg.AutoScalingGroup(this, "ASG", {
      autoScalingGroupName: names.hyphenatedPrefix + `${props.clusterRole}`,
      vpc: props.vpc,
      vpcSubnets: props.subnets,
      launchTemplate: bootstrapTemplate,
      maxCapacity: props.capacityUpperBound,
      minCapacity: 0,
      healthCheck: props.immuneFromLbHealthChecks
        ? asg.HealthCheck.ec2({
            grace: cdk.Duration.minutes(5),
          })
        : asg.HealthCheck.elb({
            grace: cdk.Duration.minutes(5),
          }),
    });

    
    /*
    this.autoScalingGroup.addLifecycleHook("init", {
      lifecycleHookName: $hyphenated`initializer-${props.clusterRole}`,
      lifecycleTransition: asg.LifecycleTransition.INSTANCE_LAUNCHING,
      notificationMetadata: `${props.clusterRole}`,
      heartbeatTimeout: cdk.Duration.minutes(10)
    });
    */
    
    Tags.of(this.autoScalingGroup).add("Role", props.clusterRole, {
      applyToLaunchedInstances: true,
    });
  }
}
