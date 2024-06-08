import { Construct } from "constructs";
import { aws_iam as iam, aws_codebuild as cb, Stack } from "aws-cdk-lib";
import { MaestroAdminCodeBuildProject } from "./MaestroAdminCodeBuildProject";

const constructName = "SingletonMaestroAdminCodeBuildProject";

export class MaestroAdminSingletonCodeBuildProject extends Construct {
  readonly commonPolicy: iam.IManagedPolicy;
  readonly cbProject: cb.IProject;

  constructor(parent: Construct, name: string, props: {}) {
    super(parent, name);
    const proj = this.ensureProject();
    this.cbProject = proj.cbProject;
    this.commonPolicy = proj.commonInvocationPermissions;
  }

  private ensureProject(): MaestroAdminCodeBuildProject {
    const constructName = "SingletonMaestroAdminCodeBuildProject";
    const existing = Stack.of(this).node.tryFindChild(constructName);
    if (existing) {
      // Just assume this is true
      return existing as MaestroAdminCodeBuildProject;
    }

    return new MaestroAdminCodeBuildProject(Stack.of(this), constructName, {});
  }
}
