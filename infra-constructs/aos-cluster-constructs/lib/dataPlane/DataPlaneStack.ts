import { App, Stack, Tags } from "aws-cdk-lib";
import {
  aws_ec2 as ec2,
  aws_autoscaling as asg,
  aws_ssm as ssm,
  aws_iam as iam,
  aws_servicediscovery as srv,
  aws_lambda as lambda,
  region_info as regions,
} from "aws-cdk-lib";
import { SearchCluster } from "./SearchCluster";
import { ClusterRoleType,IAmiProvider } from "./Types";
import { BaseStack } from "../base";
import { fromParams } from "../common";
import * as aosInternal from "../../../aos-internal-constructs/dist";
import type * as schemas from '../schema';
import { Construct } from "constructs";

interface PlanarResources {
  vpc: ec2.IVpc;
  rootCa: aosInternal.IRootCA;
  maestroEndpoint: string;
  maestroInvokePolicy: iam.ManagedPolicy;
  maestroEventSubmitterPolicy: iam.ManagedPolicy;
  discoveryService: srv.Service;
  forwarderFunc: lambda.Function;
}

interface DataPlaneStackProps {
  resources: PlanarResources;
  //snapshotting: schemas.SnapshottingProps;
  logging: schemas.LoggingProps;
  capacity: schemas.CapacityProps;
  topology: schemas.TopologyProps;
  amis: {
    x86_64: ssm.IStringParameter;
    arm_64: ssm.IStringParameter;
  };
}

type RoleInfo = {
  name: string,
  lbVisible: boolean
}
const roleInfo: Record<schemas.NodeCapability, RoleInfo> = {
  Data: { name: "data", lbVisible: true },
  Ingest: { name: "ingest", lbVisible: false },
  ML: { name: "ml", lbVisible: true },
  SnapshotSearch: { name: "data", lbVisible: false },
  RemoteClient: { name: "remote_client", lbVisible: true },
};

export class DataPlaneStack extends BaseStack {
  readonly searchCluster: SearchCluster;
  readonly hydrateParam: ssm.StringParameter;

  constructor(parent: App, id: string, props: DataPlaneStackProps) {
    super(parent, id);

    const amiProvider: IAmiProvider = {
      amiForInstance: (it: ec2.InstanceType) => {
        if (it.architecture === ec2.InstanceArchitecture.ARM_64) {
          return ec2.MachineImage.resolveSsmParameterAtLaunch(
            props.amis.arm_64.parameterName
          );
        } else {
          return ec2.MachineImage.resolveSsmParameterAtLaunch(
            props.amis.x86_64.parameterName
          );
        }
      },
    };

    const sc = new SearchCluster(this, "SearchCluster", {
      ...props.resources,
      logging: props.logging,
      amis: amiProvider,
      //snapshotting: props.snapshotting
    });

    const info = fromParams(this);
    const names = info.namesFor(this);

    const capProviders = props.capacity.providers;
    const capMap = new Map<string, schemas.CapacityProviderProps>();
    capProviders.forEach((cp) => {
      if (cp.type === "FARGATE") {
        throw new Error("Fargate cap providers not yet supported.");
      }
      capMap.set(cp.capacityProviderName, cp);
    });

    sc.addRole("bootstrapper", new ec2.InstanceType("c6g.large"), {
      immuneFromHealthChecks: true,
      capacityMaximum: 1,
    });

    props.topology.nodeSpecifications.forEach((n) => {
      const provider = capMap.get(n.capacityProviderName)!;
      if (provider.type === "FARGATE") {
        throw new Error("Fargate cap providers not yet supported.");
      }

      const itype = new ec2.InstanceType(provider?.instanceType);
      if (n.type === "DedicatedManager") {
        sc.addRole("cluster_manager", itype, {
          immuneFromHealthChecks: true,
          capacityMaximum: n.maxCount,
        });
      } else if (n.type === "DedicatedCoordinator") {
        sc.addRole("coordinator", itype, {
          immuneFromHealthChecks: true,
          capacityMaximum: n.maxCount,
        });
      } else {
        const roles = n.type.map((r) => roleInfo[r]);
        sc.addRole(roles[0].name as ClusterRoleType, itype, {
          inLoadBalancer: roles.filter((ri) => ri.lbVisible).length > 0,
          capacityMaximum: n.maxCount,
        });
      }
    });

    Tags.of(sc).add("Cluster", info.name, {
      applyToLaunchedInstances: true,
    });

    this.hydrateParam = new ssm.StringParameter(this, "HydrateParam", {
      parameterName: names.paramPrefix + "dataPlane",
      simpleName: false,
      stringValue: Stack.of(this).toJsonString({
        LoadBalancerDnsName: sc.clusterLb.lb.loadBalancerDnsName,
      }),
    });
    this.searchCluster = sc;
  }
}
