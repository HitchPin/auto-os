import { Construct } from "constructs";
import {
  aws_ec2 as ec2,
  aws_ssm as ssm,
  aws_iam as iam,
  aws_kms as kms,
  aws_secretsmanager as sm,
  aws_lambda as lambda,
  custom_resources as cr,
  CustomResource,
} from "aws-cdk-lib";
import * as path from "path";
import * as fs from "fs";

const getHandler = (): string => {
  const pyPath = path.join(
    path.resolve(__dirname),
    "./cluster_ep.py"
  );
  return fs.readFileSync(pyPath).toString("utf8");
};

interface ClusterEndpointProps {
  vpc: ec2.IVpc;
  instanceRole: iam.Role;
  encryptionKey: kms.IKey;
  controlPlaneHydrateParam: ssm.IStringParameter;
  dataPlaneHydrateParam: ssm.IStringParameter;
}

interface NetworkingConfig {
  readonly vpc: ec2.IVpc;
  readonly subnets: ec2.SubnetSelection;
  readonly securityGroup: ec2.SecurityGroup;
}

export interface IClusterEndpoint {
  readonly clusterUrl: string;
  readonly endpointNetworking: NetworkingConfig;
  readonly instanceRole: iam.Role;
  readonly adminCredsSecret: sm.ISecret;
  readonly clusterPolicy: iam.ManagedPolicy;
  readonly encryptionKey: kms.IKey;
}

export class ClusterEndpoint extends Construct implements IClusterEndpoint {
  readonly endpointNetworking: NetworkingConfig;
  readonly sg: ec2.SecurityGroup;
  readonly instanceRole: iam.Role;
  readonly clusterUrl: string;
  readonly adminCredsSecret: sm.ISecret;
  readonly clusterPolicy: iam.ManagedPolicy;
  readonly encryptionKey: kms.IKey;

  constructor(parent: Construct, name: string, props: ClusterEndpointProps) {
    super(parent, name);

    const sg = new ec2.SecurityGroup(this, "Sg", {
      vpc: props.vpc,
      allowAllOutbound: true,
    });
    this.endpointNetworking = {
      vpc: props.vpc,
      subnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroup: sg,
    };
    this.encryptionKey = props.encryptionKey;
    this.instanceRole = props.instanceRole;

    const r = new iam.Role(this, "Role", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaVPCAccessExecutionRole"
        ),
      ],
      inlinePolicies: {
        paramUpdate: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["ssm:GetParameter"],
              resources: [
                props.dataPlaneHydrateParam.parameterArn,
                props.controlPlaneHydrateParam.parameterArn,
              ],
            }),
          ],
        }),
      },
    });
    const f = new lambda.Function(this, "Func", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "index.on_event",
      code: lambda.Code.fromInline(getHandler()),
      role: r,
      // This function doesn't need to be a VPC function but
      // since the creation of the first hyperplane ENI per vpc/subnet/security group combination
      // takes a while, we do it up front here so the other
      // custom resource providers are speedy
      vpc: this.endpointNetworking.vpc,
      vpcSubnets: this.endpointNetworking.subnets,
      securityGroups: [this.endpointNetworking.securityGroup],
    });
    const provider = new cr.Provider(this, "Provider", {
      onEventHandler: f,
    });
    const rsrc = new CustomResource(this, "CustomResource", {
      properties: {
        DataPlaneHydrateParam: props.dataPlaneHydrateParam.parameterName,
        ControlPlaneHydrateParam: props.controlPlaneHydrateParam.parameterName,
      },
      serviceToken: provider.serviceToken,
    });
    this.clusterUrl = rsrc.getAttString("ClusterUrl");
    this.adminCredsSecret = sm.Secret.fromSecretCompleteArn(
      this,
      "Arn",
      rsrc.getAttString("AdminCredsSecretId")
    );

    this.clusterPolicy = new iam.ManagedPolicy(this, "Policy", {
      statements: [
        new iam.PolicyStatement({
          actions: ["secretsmanager:GetSecretValue"],
          resources: [this.adminCredsSecret.secretArn],
        }),
        new iam.PolicyStatement({
          actions: ["kms:Encrypt", "kms:Decrypt", "kms:GenerateDataKey"],
          resources: [props.encryptionKey.keyArn],
        }),
      ],
    });
  }
}
