import { Construct } from "constructs";
import { aws_iam as iam, aws_codebuild as cb, aws_ecr as ecr, Stack } from "aws-cdk-lib";
import { MaestroAdminCodeBuildProject } from "./MaestroAdminCodeBuildProject";

const constructName = "SingletonMaestroAdminCodeBuildProject";

interface MaestroAdminSingletonCodeBuildProjectProps {
  buildImageRepo: ecr.IRepository,
  tag: string
}

export class MaestroAdminSingletonCodeBuildProject extends Construct {
  readonly commonPolicy: iam.IManagedPolicy;
  readonly cbProject: cb.IProject;

  constructor(parent: Construct, name: string, props: MaestroAdminSingletonCodeBuildProjectProps) {
    super(parent, name);
    const proj = this.ensureProject(props);
    this.cbProject = proj.cbProject;
    this.commonPolicy = proj.commonInvocationPermissions;
  }

  private ensureProject(props: MaestroAdminSingletonCodeBuildProjectProps): MaestroAdminCodeBuildProject {
    const constructName = "SingletonMaestroAdminCodeBuildProject";
    const existing = Stack.of(this).node.tryFindChild(constructName);
    if (existing) {
      // Just assume this is true
      return existing as MaestroAdminCodeBuildProject;
    }

    return new MaestroAdminCodeBuildProject(Stack.of(this), constructName, props);
  }
}
