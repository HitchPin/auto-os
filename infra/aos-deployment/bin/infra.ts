#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as stacks from '../lib';

const app = new cdk.App();
const foundation = new stacks.FoundationStack(app, "Foundation");
const bakery = new stacks.BakeryStack(app, "Bakery", {
  amdParam: foundation.amdParam,
  armParam: foundation.armParam
});
const substrate = new stacks.SubstrateStack(app, "Substrate");
const cpStack = new stacks.ControlPlaneStack(app, 'ControlPlane', {
    vpc: substrate.vpc,
    discoveryNamespace: substrate.discoveryNamespace,
    confBucket: substrate.assetsBucket,
    encryptionKey: substrate.encryptionKey,
    confPrefix: substrate.confPrefix
});
const dpStack = new stacks.DataPlaneStack(app, "DataPlane", {
  resources: {
    vpc: substrate.vpc,
    maestroInvokePolicy: cpStack.maestroInvokePolicy,
    maestroEndpoint: cpStack.endpoint,
    forwarderFunc: cpStack.eventNotifications.forwarder.func,
    rootCa: cpStack.rootCa,
    maestroEventSubmitterPolicy:
      cpStack.eventNotifications.eventSubmitterPolicy,
    discoveryService: cpStack.discoveryService,
  },
  amis: {
    arm_64: foundation.armParam,
    x86_64: foundation.amdParam,
  },
  logging: {
    enabled: false,
  },
  capacity: {
    providers: [
      {
        capacityProviderName: "bursty",
        type: "EC2_ASG",
        instanceType: "t4g.large",
      },
      {
        capacityProviderName: "general",
        type: "EC2_ASG",
        instanceType: "c6g.large",
      },
      {
        capacityProviderName: "ml",
        type: "EC2_ASG",
        instanceType: "inf2.xlarge",
      },
    ],
  },
  topology: {
    zoneAwareness: true,
    nodeSpecifications: [
      {
        type: "DedicatedManager",
        minCount: 3,
        maxCount: 3,
        capacityProviderName: "bursty",
      },
      {
        type: ["Data", "Ingest"],
        minCount: 1,
        maxCount: 3,
        capacityProviderName: "general",
      },
      {
        type: ["ML"],
        minCount: 1,
        maxCount: 3,
        capacityProviderName: "ml",
      },
    ],
  },
});
new stacks.ManagementStack(app, "Management", {
  vpc: substrate.vpc,
  instanceRole: dpStack.searchCluster.instanceRole,
  encryptionKey: substrate.encryptionKey,
  substrateHydrateParam: substrate.hydrateParam,
  controlPlaneHydrateParam: cpStack.hydrateParam,
  dataPlaneHydrateParam: dpStack.hydrateParam
});