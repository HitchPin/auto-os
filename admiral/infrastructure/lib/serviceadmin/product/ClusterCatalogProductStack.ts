import {
    aws_servicecatalog as svcCat,
    aws_s3 as s3,
    aws_ecr as ecr,
    aws_s3_deployment as s3deploy,
    aws_kms as kms
} from "aws-cdk-lib";
import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as stacks from '../../../../../infra-constructs/aos-cluster-constructs/dist'
import { BundledProductAssets } from "../assets";

interface ClusterCatalogProductStackProps {
  assets: BundledProductAssets,
  assetBucket: s3.IBucket,
  encryptionKeyId: string
}
export class ClusterCatalogProductStack extends svcCat.ProductStack {

  constructor(parent: Construct, name: string, props: ClusterCatalogProductStackProps) {
    super(parent, name, {
      assetBucket: props.assetBucket,
      serverSideEncryption: s3deploy.ServerSideEncryption.AWS_KMS,
      serverSideEncryptionAwsKmsKeyId: props.encryptionKeyId
    });

    const dnsRootParam = new cdk.CfnParameter(this, "ClusterDnsRoot", {});
    const nameParam = new cdk.CfnParameter(this, "ClusterName", {});
    const idParam = new cdk.CfnParameter(this, "ClusterId");
    
    const arm64Param = new cdk.CfnParameter(this, 'arm64_AMI', {
      type: 'String',
      default: 'ami-0abed5bca871d2860'
    })
    const amd64Param = new cdk.CfnParameter(this, 'amd64_AMI', {
      type: 'String',
      default: 'ami-07aebb57614f33341'
    })

    const commonProps = {
      dnsRoot: dnsRootParam.valueAsString,
      clusterName: nameParam.valueAsString,
      clusterId: idParam.valueAsString
    }
    const substrate = new stacks.SubstrateNestedStack(this, "Substrate", {
      configBucketName: props.assets.bucketName,
      configPrefix: props.assets.baseConfigPrefix,
      ...commonProps
    });
    const cpStack = new stacks.ControlPlaneStack(this, 'ControlPlane', {
        vpc: substrate.vpc,
        discoveryNamespace: substrate.discoveryNamespace,
        assetBucket: props.assetBucket,
        encryptionKey: substrate.encryptionKey,
        confPrefix: substrate.confPrefix,
        maestroFuncKey: props.assets.controlPlane.maestroFuncKey,
        discoCleanupFuncKey: props.assets.controlPlane.discoCleanerFuncKey,
        eventForwarderFuncKey: props.assets.controlPlane.discoCleanerFuncKey,
        ...commonProps
    });

    const dpStack = new stacks.DataPlaneStack(this, "DataPlane", {
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
        arm64Ami: arm64Param.valueAsString,
        amd64Ami: amd64Param.valueAsString,
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
      ...commonProps
    });

    /*
    new stacks.ManagementStack(this, "Management", {
      vpc: substrate.vpc,
      instanceRole: dpStack.searchCluster.instanceRole,
      encryptionKey: substrate.encryptionKey,
      substrateHydrateParam: substrate.hydrateParam,
      controlPlaneHydrateParam: cpStack.hydrateParam,
      dataPlaneHydrateParam: dpStack.hydrateParam,
      invocationRepo: ecr.Repository.fromRepositoryName(this, 'InvocationRepo', props.assets.invocationRepoName),
      invocationTag: props.assets.invocationTag,
      ...commonProps
    });
    */
  }
}
