import * as path from "path";
import {
  Duration,
  CfnWaitCondition,
  CfnWaitConditionHandle,
  aws_codebuild as cb,
  aws_ec2 as ec2,
  aws_iam as iam,
  aws_lambda as lambda,
  aws_stepfunctions as sfn,
  aws_stepfunctions_tasks as sfnTasks,
  custom_resources as cr
} from "aws-cdk-lib";
import { Construct } from "constructs";

export interface CodeBuildRunnerProps {
  readonly timeout?: string;
  readonly vpc: ec2.IVpc;
  readonly buildSpec: cb.BuildSpec;
  readonly buildImage: cb.IBuildImage;
}

export class CodeBuildRunner extends Construct {

  public readonly waitConditionHanlderEndpoint: string;
  private readonly waitCondition: CfnWaitCondition;

  constructor(scope: Construct, id: string, props: CodeBuildRunnerProps) {
    super(scope, id);

    const project = new cb.Project(this, "Project", {
      buildSpec: props.buildSpec,
      environment: {
        buildImage: props.buildImage
      }
    });

    //use time stamp for uiniq ID for resource that need to be recareted.
    const uniqueValue = Date.now().toString();

    //wait condition handler
    const waitConditionHandler = new CfnWaitConditionHandle(
      this,
      `FargateRunnerWaitConditionHandle-${uniqueValue}`,
      {}
    );

    //wait condition
    this.waitCondition = new CfnWaitCondition(
      this,
      `FargateRunnerWaitCondition-${uniqueValue}`,
      {
        count: 1,
        timeout: props.timeout ?? `${60 * 60}`,
        handle: waitConditionHandler.ref,
      }
    );

    //Lambda execution role:
    const executionRole = new iam.Role(this, "CallbackExecutionRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    //add persmission of ecs:DescribeTasks to the execution role
    executionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["codebuild:ListBuildsForProject"],
        resources: [ project.projectArn ],
        effect: iam.Effect.ALLOW,
        sid: "CallbackDescribeTasks",
      })
    );

    //add permision of lambda execution role to write log to CloudWatch
    executionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams",
        ],
        resources: ["*"],
        effect: iam.Effect.ALLOW,
        sid: "CallbackLog",
      })
    );

    //lambda function that send SUCCESS Signal back to WaitCondition
    const callbackFunction = new lambda.Function(this, "CallbackFunction", {
      code: lambda.Code.fromAsset(path.join(__dirname, "./lambda/callBack")),
      runtime: lambda.Runtime.PYTHON_3_10,
      handler: "app.lambda_handler",
      timeout: Duration.seconds(180),
      environment: {
        WAIT_CONDITION_HANDLE_URL: waitConditionHandler.ref,
      },
      role: executionRole,
    });

    //errorhandler function, to send FAILURE Signal back to WaitCondition
    const errorHandlerFunction = new lambda.Function(this, "ErrorHandlerFunction", {
      code: lambda.Code.fromAsset(
        path.join(__dirname, "./lambda/errorHandler")
      ),
      runtime: lambda.Runtime.PYTHON_3_10,
      handler: "app.lambda_handler",
      role: executionRole,
      timeout: Duration.seconds(180),
      environment: {
        WAIT_CONDITION_HANDLE_URL: waitConditionHandler.ref,
      },
    });
    

    // Define the ECS Run Task using Step Functions
    const runTask = new sfnTasks.CodeBuildStartBuild(this, "StartBuildTask", {
      integrationPattern: sfn.IntegrationPattern.RUN_JOB,
      project: project,
      //add error handler and send FAILURE signal to Wait Condition to stop the stack.
    }).addCatch(
      new sfnTasks.LambdaInvoke(this, "Handle Error", {
        lambdaFunction: errorHandlerFunction,
        resultPath: "$.errorInfo",
      }),
      {
        errors: ["States.ALL"], // Catch all errors
      }
    );

    // Define Lambda function step function statemachine task
    const lambdaTask = new sfnTasks.LambdaInvoke(
      this,
      "InvokeLambdaTask",
      {
        lambdaFunction: callbackFunction,
        inputPath: "$",
      }
    );

    // define the step function chain
    const chain = sfn.Chain.start(runTask).next(lambdaTask);

    // execution role for statemachine:
    const stateMachineExecutionRole = new iam.Role(
      this,
      "FargateRunnerStateMachineExecutionRole",
      {
        assumedBy: new iam.ServicePrincipal("states.amazonaws.com"),
      }
    );
    stateMachineExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction"],
        resources: [
          callbackFunction.functionArn,
          errorHandlerFunction.functionArn,
        ],
        effect: iam.Effect.ALLOW,
        sid: "InvokeLambda",
      })
    );

    // add iam:PassRole to the execution role
    stateMachineExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["iam:PassRole"],
        resources: [executionRole.roleArn, stateMachineExecutionRole.roleArn],
        effect: iam.Effect.ALLOW,
        sid: "PassRole",
      })
    );

    // add ecs:RunTask permission to the execution role
    stateMachineExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["codebuild:StartBuild"],
        resources: [project.projectArn],
        effect: iam.Effect.ALLOW,
        sid: "StartBuild",
      })
    );

    // define the statemachine
    const stateMachine = new sfn.StateMachine(
      this,
      "FargateRunnerStateMachine",
      {
        definitionBody: sfn.DefinitionBody.fromChainable(chain),
        // timeout: timeoutDuration
        // role: stateMachineExecutionRole,
      }
    );

    //define triggering custom resource
    const customResourceTrigger = new cr.AwsCustomResource(
      this,
      `FargateRunnerTrigger-${uniqueValue}`,
      {
        policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
          resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
        onCreate: {
          service: "StepFunctions",
          action: "startExecution",
          parameters: {
            stateMachineArn: stateMachine.stateMachineArn,
          },
          physicalResourceId: cr.PhysicalResourceId.of(Date.now().toString()),
        },
      }
    );

    //add dependency: Trigger custom resource depends on waitcondition handler
    customResourceTrigger.node.addDependency(waitConditionHandler);

    //expose the waitcondition url
    this.waitConditionHanlderEndpoint = waitConditionHandler.ref;

    //default child
    this.node.defaultChild = this.waitCondition;
  }
}
