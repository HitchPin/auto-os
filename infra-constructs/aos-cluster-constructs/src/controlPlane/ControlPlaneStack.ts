import * as cdk from "aws-cdk-lib";
import {
  aws_ec2 as ec2,
  aws_s3 as s3,
  aws_servicediscovery as srv,
  aws_ssm as ssm,
  aws_iam as iam,
  aws_secretsmanager as sm,
  aws_kms as kms,
  aws_servicecatalog as svcCat,
  Duration
} from "aws-cdk-lib";
import * as aosInternal from "../../../aos-internal-constructs/dist";
import { fromParams } from "../common";
import { BaseNestedStack, BaseNestedStackProps } from "../base";
import { EventNotifications } from './EventNotifications';
import { ApiFunc } from './ApiFunc';
import { ApiEndpoint } from "./ApiEndpoint";
import { RegistrationCleanup } from "./RegistrationCleanup";
import { Construct } from 'constructs';
import { ProductIdentifier } from "../../../aos-internal-constructs/dist";

interface ControlPlaneStackProps extends BaseNestedStackProps {
  discoveryNamespace: srv.IPrivateDnsNamespace;
  vpc: ec2.IVpc;
  encryptionKey: kms.IKey;
  assetBucket: s3.IBucket;
  confPrefix: string;
  maestroFuncKey: string;
  eventForwarderFuncKey: string;
  discoCleanupFuncKey: string;
}

export class ControlPlaneStack extends BaseNestedStack {
  readonly rootCa: aosInternal.RootCA;
  readonly hydrateParam: ssm.StringParameter;
  readonly maestroInvokePolicy: iam.ManagedPolicy;
  readonly endpoint: string;
  readonly discoveryService: srv.Service;
  readonly eventNotifications: EventNotifications;

  constructor(scope: Construct, id: string, props: ControlPlaneStackProps) {
    super(scope, id, props);

    const info = fromParams(this);
    const names = info.namesFor(this);

    const pid = new ProductIdentifier(this, 'Pid');

    this.rootCa = new aosInternal.RootCA(this, "RootCA", {
      expiration: Duration.days(365 * 10),
      keySize: aosInternal.RootCAKeySize.Bits2048,
      encryptionKey: props.encryptionKey,
      secretName: '/' + pid.productId + '/rootCA',
      subject: {
        commonName: info.dnsRoot,
        stateOrProvince: "Texas",
        city: "Dallas",
        country: "US",
        organization: "HitchPin",
      },
    });

    const eventNotifications = new EventNotifications(
      this,
      "EventNotifications",
      {
        assetBucket: props.assetBucket,
        eventForwarderFuncKey: props.eventForwarderFuncKey
      }
    );

    const service = new srv.Service(this, "Service", {
      namespace: props.discoveryNamespace,
      name: "search-nodes",
    });

    const clusterAdminSecret = new sm.Secret(this, "ClusterAdminPwdSecret", {
      secretName: names.paramPrefix + `maestro/clusterAdminPwd`,
      encryptionKey: props.encryptionKey,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ Username: "admin" }),
        generateStringKey: "Password",
        excludeCharacters: "/@",
        includeSpace: false,
        passwordLength: 12,
        requireEachIncludedType: true,
      },
    });
    const clusterNameParam = new ssm.StringParameter(this, "ClusterParam", {
      parameterName: names.paramPrefix + `maestro/clusterName`,
      simpleName: false,
      stringValue: info.name,
    });
    const clusterModeParam = new ssm.StringParameter(this, "CluterModeParam", {
      parameterName: names.paramPrefix + `maestro/clusterMode`,
      simpleName: false,
      stringValue: "bootstrapping",
    });

    const apiFunc = new ApiFunc(this, "ApiFunc", {
      encryptionKey: props.encryptionKey,
      clusterNameParam: clusterNameParam,
      clusterModeParam: clusterModeParam,
      rootCaSecret: this.rootCa.materialsSecret,
      clusterAdminSecret: clusterAdminSecret,
      eventDedupeQueue: eventNotifications.eventDedupeQueue,
      eventBus: eventNotifications.bus,
      assetBucket: props.assetBucket,
      confPrefix: props.confPrefix,
      funcKey: props.maestroFuncKey,
      vpc: props.vpc,
      subnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      discoveryNs: props.discoveryNamespace,
      discoverySvc: service,
      extraPolicies: [eventNotifications.eventSubmitterPolicy],
    });
    const apiEndpoint = new ApiEndpoint(this, "ApiEndpoint", {
      func: apiFunc.func,
    });

    new RegistrationCleanup(this, "Cleanup", {
      discoNs: props.discoveryNamespace,
      discoSvc: service,
      eventBus: eventNotifications.bus,
      assetBucket: props.assetBucket,
      discoCleanupFuncKey: props.discoCleanupFuncKey
    });

    this.maestroInvokePolicy = apiEndpoint.maestroInvokePolicy;
    this.endpoint = apiEndpoint.apiEndpoint;
    this.eventNotifications = eventNotifications;

    this.hydrateParam = new ssm.StringParameter(this, "HydrateParam", {
      parameterName: names.paramPrefix + "controlPlane",
      simpleName: false,
      stringValue: cdk.Stack.of(this).toJsonString({
        ClusterModeParamId: clusterModeParam.parameterName,
        ClusterNameParamId: clusterNameParam.parameterName,
        EventBusName: eventNotifications.bus.eventBusName,
        EventLogGroupName: eventNotifications.eventStreamLogs.logGroupName,
        ClusterAdminSecretId: clusterAdminSecret.secretArn,
        CertificateAuthoritySecretId: this.rootCa.materialsSecret.secretArn,
        DiscoServiceName: service.serviceName,
        DiscoServiceId: service.serviceId,
      }),
    });
  }
}
