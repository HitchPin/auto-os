import {
  aws_lambda as lambda,
  aws_lambda_event_sources as evtSrc,
  aws_iam as iam,
  aws_sqs as sqs,
  aws_events as events,
  aws_events_targets as targets,
  Duration,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import * as fs from "fs";
import { fromParams } from "../common";

const code = fs
  .readFileSync(path.join(__dirname, "./forwarder.py"))
  .toString("utf8");

interface EventForwarderProps {
  dedupeQueue: sqs.Queue;
  eventBus: events.EventBus;
}

export class EventForwarder extends Construct {
  readonly func: lambda.Function;
  constructor(parent: Construct, name: string, props: EventForwarderProps) {
    super(parent, name);

    const info = fromParams(this);
    const names = info.namesFor(this);

    const forwarderRole = new iam.Role(this, "ForwarderRole", {
      roleName: names.hyphenatedPrefix + `MaestroDedupedEventForwarderRole`,
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          `service-role/AWSLambdaBasicExecutionRole`
        ),
      ],
      inlinePolicies: {
        "asg-enricher": new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["autoscaling:DescribeAutoScalingGroups"],
              resources: ["*"],
            }),
          ],
        }),
      },
    });
    this.func = new lambda.Function(this, "ForwarderLambda", {
      functionName: names.hyphenatedPrefix + `MaestroDedupedEventForwarder`,
      code: lambda.Code.fromInline(code),
      runtime: lambda.Runtime.PYTHON_3_12,
      memorySize: 1024,
      timeout: Duration.seconds(15),
      handler: "index.handle",
      environment: {
        EVENT_BUS_NAME: props.eventBus.eventBusName,
      },
      role: forwarderRole,
    });
    this.func.addEventSource(
      new evtSrc.SqsEventSource(props.dedupeQueue, {
        batchSize: 1,
      })
    );
    forwarderRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ["events:PutEvents"],
        resources: [props.eventBus.eventBusArn],
      })
    );
  }
}
