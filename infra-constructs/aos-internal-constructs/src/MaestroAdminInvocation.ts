import { Construct } from "constructs";
import {
    aws_ssm as ssm,
    aws_ecr as ecr,
    aws_iam as iam,
    Token,
} from 'aws-cdk-lib';
import * as internal from './internal';
import * as gen from "./generated";

export type Hydration = {
  substrate: ssm.IStringParameter;
  controlPlane: ssm.IStringParameter;
  dataPlane: ssm.IStringParameter;
};
export interface MaestroAdminInvocationProps {
  hydration: Hydration;
  cliCommand: string;
  invocationProjectRepo: ecr.IRepository;
  invocationProjectTag: string;
}

export interface IMaestroAdminInvocation {
  readonly role: iam.IRole;
  readonly invocationId: string;
  readonly commandOutput: string;
}

export class MaestroAdminInvocation extends Construct {
  readonly role: iam.IRole;
  private readonly cfnResource: gen.CfnMaestroAdminCliInvocation;

  get commandOutput(): string {
    return Token.asString(this.cfnResource.attrCommandOutput);
  }

  get invocationId(): string {
    return Token.asString(this.cfnResource.attrInvocationId);
  }

  constructor(
    parent: Construct,
    name: string,
    props: MaestroAdminInvocationProps
  ) {
    super(parent, name);

    const proj = new internal.MaestroAdminSingletonCodeBuildProject(
      this,
      "Project",
      {
        buildImageRepo: props.invocationProjectRepo,
        tag: props.invocationProjectTag
      }
    );

    const role = new iam.Role(this, "Role", {
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
      managedPolicies: [
        proj.commonPolicy,
        iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')
      ]
    });
    props.hydration.substrate.grantRead(role);
    props.hydration.controlPlane.grantRead(role);
    props.hydration.dataPlane.grantRead(role);

    this.cfnResource = new gen.CfnMaestroAdminCliInvocation(this, "CfnInvocation", {
      projectName: proj.cbProject.projectName,
      cliCommand: props.cliCommand,
      hydration: {
        substrateParamName: props.hydration.substrate.parameterName,
        controlPlaneParamName: props.hydration.controlPlane.parameterName,
        dataPlaneParamName: props.hydration.controlPlane.parameterName,
      },
      roleArn: role.roleArn,
    });
    this.role = role;

  }
}