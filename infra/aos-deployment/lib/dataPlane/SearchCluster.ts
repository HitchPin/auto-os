import {
  aws_ec2 as ec2,
  aws_s3 as s3,
  aws_autoscaling as asg,
  aws_iam as iam,
  aws_elasticloadbalancingv2 as elb,
  aws_elasticloadbalancingv2_targets as elbTargets,
  aws_servicediscovery as srv,
  aws_events as evts,
  aws_events_targets as evtsTargets,
  aws_lambda as lambda,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { ClusterAsg } from "./ClusterAsg";
import { IndividualClusterLogging, CombinedClusterLogging } from "./ClusterLogging";
import { ClusterLb } from "./ClusterLb";
import { ClusterSnapshots } from "./ClusterSnapshots";
import type { ClusterRoleType, IAmiProvider } from './Types';
import { fromParams } from "../common";
import * as aosInternal from "../../../aos-cdk-internal/dist";
import { SnapshottingProps, LoggingProps } from "../schema";

type ClusterRoleProps = {
  capacityMaximum?: number,
  immuneFromHealthChecks?: boolean,
  inLoadBalancer?: boolean,
}

type RoleAsgRecord = Partial<Record<ClusterRoleType, ClusterAsg>>;
interface SearchClusterProps {
  vpc: ec2.IVpc;
  maestroEndpoint: string;
  maestroInvokePolicy: iam.ManagedPolicy;
  maestroEventSubmitterPolicy: iam.ManagedPolicy;
  discoveryService: srv.Service;
  forwarderFunc: lambda.IFunction;
  rootCa: aosInternal.IRootCA;
  //snapshotting: SnapshottingProps
  logging: LoggingProps;
  amis: IAmiProvider;
}

export class SearchCluster extends Construct {
  readonly props: SearchClusterProps;
  readonly autoScalingGroup: asg.AutoScalingGroup;
  readonly instanceRole: iam.Role;
  readonly opensearchSg: ec2.SecurityGroup;
  readonly subnetSelection: ec2.SubnetSelection;
  //readonly snapshots: ClusterSnapshots;
  readonly logging: IndividualClusterLogging | CombinedClusterLogging | undefined;

  private readonly roleAsgs: RoleAsgRecord;
  readonly clusterLb: ClusterLb;
  private readonly asgLaunchRule: evts.Rule;

  constructor(scope: Construct, id: string, props: SearchClusterProps) {
    super(scope, id);
    this.props = props;

    const info = fromParams(this);
    const names = info.namesFor(this);

    this.subnetSelection = {
      subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
    };
    

    if (props.logging.enabled) {
      if ('logGroupName' in props.logging) {
        this.logging = new CombinedClusterLogging(this, 'CombinedLogging', {
          logGroupName: props.logging.logGroupName
        });
      } else {
        const lgn = props.logging.logGroupNames;
        this.logging = new IndividualClusterLogging(this, 'IndividualLogging', {
          searchLogs: lgn.search,
          searchServerLogs: lgn.searchServer,
          slowIndexLogs: lgn.indexingSlow,
          slowSearchLogs: lgn.searchSlow,
          taskLogs: lgn.taskDetails
        });
      }
    }

    /*
    this.snapshots = new ClusterSnapshots(this, "Snapshots", {
      bucket: s3.Bucket.fromBucketName(this, 'SnapshotBucket', props.snapshotting.bucketName),
      prefix: props.snapshotting.prefix,
      cronSchedule: props.snapshotting.schedule
    });
    */

    this.instanceRole = new iam.Role(this, "InstanceRole", {
      roleName: names.hyphenatedPrefix + `SearchClusterInstanceRole`,
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        props.maestroInvokePolicy,
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonSSMManagedEC2InstanceDefaultPolicy"
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "CloudWatchAgentServerPolicy"
        ),
        props.maestroEventSubmitterPolicy,
        //this.snapshots.snapshotManagerPolicy,
      ],
    });

    this.opensearchSg = new ec2.SecurityGroup(this, "Sg", {
      securityGroupName: names.hyphenatedPrefix + `OpenSearchSg`,
      vpc: props.vpc,
    });
    this.opensearchSg.addIngressRule(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      ec2.Port.tcpRange(9200, 9600)
    );

    this.roleAsgs = {};
    this.clusterLb = new ClusterLb(this, "Alb", {
      vpc: props.vpc,
      subnets: this.subnetSelection,
      rootCa: props.rootCa
    });

    this.asgLaunchRule = new evts.Rule(this, "AsgRule", {
      ruleName: names.hyphenatedPrefix + `asgs`,
      eventPattern: {
        source: ["aws.autoscaling"],
        detailType: ["EC2 Instance Launch Successful"],
        detail: {},
      },
    });
    this.asgLaunchRule.addTarget(
      new evtsTargets.LambdaFunction(props.forwarderFunc)
    );
  }

  addRole(
    role: ClusterRoleType,
    instanceType: ec2.InstanceType,
    options?: ClusterRoleProps
  ): ClusterAsg {
    if (role in this.roleAsgs) {
      throw new Error("Already registered this role!");
    }

    const immuneFromHealthChecks = options?.immuneFromHealthChecks ?? false;
    const capacityUpperBound = options?.capacityMaximum ?? 3;
    const lbParticipant = options?.inLoadBalancer ?? true;

    const asg = new ClusterAsg(this, `${role}Asg`, {
      maestroEndpoint: this.props.maestroEndpoint,
      instanceRole: this.instanceRole,
      vpc: this.props.vpc,
      subnets: this.subnetSelection,
      clusterRole: role,
      instanceType: instanceType,
      ami: this.props.amis.amiForInstance(instanceType),
      securityGroup: this.opensearchSg,
      capacityUpperBound: capacityUpperBound,
      immuneFromLbHealthChecks: immuneFromHealthChecks,
    });
    this.roleAsgs[role] = asg;

    if (lbParticipant) {
      this.clusterLb.registerAsg(asg);
    }

    this.asgLaunchRule.addEventPattern({
      detail: {
        AutoScalingGroupName: [asg.autoScalingGroup.autoScalingGroupName],
      },
    });
    return asg;
  }
}
