import { aws_events as evts, aws_events_targets as targets, aws_iam as iam, aws_logs as logs, aws_sqs as sqs } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib';
import * as path from "path";
import * as fs from "fs";
import { EventForwarder } from "./EventForwarder";
import { fromParams } from "../common";

const code = fs
  .readFileSync(path.join(__dirname, "./cleanup.py"))
  .toString("utf8");

export class EventNotifications extends Construct {
  readonly eventStreamLogs: logs.LogGroup;
  readonly eventDedupeQueue: sqs.Queue;
  readonly bus: evts.EventBus;
  readonly eventSubmitterPolicy: iam.ManagedPolicy;
  readonly forwarder: EventForwarder;

  constructor(parent: Construct, name: string) {
    super(parent, name);

    const info = fromParams(this);
    const names = info.namesFor(this);

    this.eventDedupeQueue = new sqs.Queue(this, "EventDedupeQueue", {
      queueName: names.hyphenatedLowercasePrefix + `maestro-deduper.fifo`,
      contentBasedDeduplication: true,
      fifo: true,
    });
    this.bus = new evts.EventBus(this, "Events", {
      eventBusName: names.hyphenatedLowercasePrefix + `maestro`,
    });
    this.eventStreamLogs = new logs.LogGroup(this, "EventStreamLogs", {
      logGroupName: names.hyphenatedPrefix + `MaestroEvents`,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    this.eventSubmitterPolicy = new iam.ManagedPolicy(
      this,
      "EventSubmitterPolicy",
      {
        managedPolicyName:
          names.hyphenatedLowercasePrefix + `MaestroEventSubmitter`,
        statements: [
          new iam.PolicyStatement({
            actions: ["events:PutEvents"],
            resources: [this.bus.eventBusArn],
          }),
          new iam.PolicyStatement({
            actions: ["sqs:SendMessage", "sqs:SendMessageBatch"],
            resources: [this.eventDedupeQueue.queueArn],
          }),
        ],
      }
    );
    
    const amiBakeryRule = new evts.Rule(this, "BakeryRule", {
      ruleName: names.hyphenatedLowercasePrefix + `MaestroBakeryRule`,
      eventPattern: {
        detailType: ["EC2 Image Builder Image State Change"],
        source: ["aws.imagebuilder"],
        resources: evts.Match.prefix(
          `arn:aws:imagebuilder:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:image/opensearch`
        ),
      },
    });

    const broadcastRule = new evts.Rule(this, "MaestroEventBroadcaster", {
      ruleName: names.hyphenatedLowercasePrefix + `MaestroBroadcastRule`,
      eventBus: this.bus,
      eventPattern: {
        source: ["maestro"],
      },
    });
    broadcastRule.addTarget(
      new targets.CloudWatchLogGroup(this.eventStreamLogs)
    );
    this.forwarder = new EventForwarder(this, "Forwarder", {
      eventBus: this.bus,
      dedupeQueue: this.eventDedupeQueue,
    });
    amiBakeryRule.addTarget(new targets.LambdaFunction(this.forwarder.func, {}));
  }
}
