import { 
    aws_lambda as lambda,
    aws_iam as iam,
    aws_s3 as s3,
    aws_events as events,
    aws_events_targets as targets,
    aws_servicediscovery as disco,
    Duration
 } from "aws-cdk-lib";
import { Construct } from "constructs";
import { fromParams } from "../common";

interface RegistrationCleanupProps {
    discoNs: disco.IPrivateDnsNamespace,
    discoSvc: disco.Service,
    eventBus: events.EventBus,
    assetBucket: s3.IBucket,
    discoCleanupFuncKey: string
}

export class RegistrationCleanup extends Construct {
  constructor(
    parent: Construct,
    name: string,
    props: RegistrationCleanupProps
  ) {
    super(parent, name);

    const info = fromParams(this);
    const names = info.namesFor(this);

    const rule = new events.Rule(this, "Rule", {
      ruleName: names.hyphenatedPrefix + `DiscoCleanupDetector`,
      eventPattern: {
        source: ["aws.ec2"],
        detailType: ["EC2 Instance State-change Notification"],
        detail: {
          state: ["terminated"],
        },
      },
    });

    const cleanupRole = new iam.Role(this, "CleanupRole", {
      roleName: names.hyphenatedPrefix + `MaestroDiscoCleanerRole`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          `service-role/AWSLambdaBasicExecutionRole`
        ),
      ],
    });
    const cleanupFunc = new lambda.Function(this, "CleanupLambda", {
      functionName: names.hyphenatedPrefix + `MaestroDiscoCleaner`,
      code: lambda.Code.fromBucket(props.assetBucket, props.discoCleanupFuncKey),
      runtime: lambda.Runtime.PYTHON_3_12,
      memorySize: 1024,
      timeout: Duration.seconds(15),
      handler: "index.handle",
      environment: {
        DISCO_SVC_ID: props.discoSvc.serviceId,
        EVENT_BUS_NAME: props.eventBus.eventBusName,
      },
      role: cleanupRole,
    });
    rule.addTarget(new targets.LambdaFunction(cleanupFunc, {

    }));
;
    cleanupRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: [
          "servicediscovery:DeregisterInstance",
        ],
        resources: [
          props.discoSvc.serviceArn,
          props.discoSvc.namespace.namespaceArn,
        ],
      })
    );
    cleanupRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ["servicediscovery:ListInstances"],
        resources: [ '*' ],
      })
    );
    cleanupRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ["ec2:DescribeInstances"],
        resources: ["*"],
      })
    );
  }
}
