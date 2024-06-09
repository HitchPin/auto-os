import {
  aws_logs as logs,
  aws_ssm as ssm,
  RemovalPolicy,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { fromParams } from "../common";

interface IndividualClusterLoggingProps {
  searchLogs: string,
  searchServerLogs: string,
  slowIndexLogs: string,
  slowSearchLogs: string,
  taskLogs: string
}

export class IndividualClusterLogging extends Construct {
  readonly searchLogGroup: logs.LogGroup;
  readonly searchServerLogGroup: logs.LogGroup;
  readonly slowIndexLogGroup: logs.LogGroup;
  readonly slowSearchLogGroup: logs.LogGroup;
  readonly tasksLogGroup: logs.LogGroup;
  readonly cwAgentConfigParam: ssm.StringParameter;

  constructor(parent: Construct, name: string, props: IndividualClusterLoggingProps) {
    super(parent, name);
    
    const info = fromParams(this);
    const names = info.namesFor(this);

    this.searchLogGroup = new logs.LogGroup(this, "SearchLogs", {
      logGroupName: names.hyphenatedPrefix + 'Logs/' + props.searchLogs,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    this.searchServerLogGroup = new logs.LogGroup(this, "SearchServerLogs", {
      logGroupName: names.hyphenatedPrefix + "Logs/" + props.searchServerLogs,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    this.slowIndexLogGroup = new logs.LogGroup(this, "SlowIndexLogs", {
      logGroupName: names.hyphenatedPrefix + "Logs/" + props.slowIndexLogs,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    this.slowSearchLogGroup = new logs.LogGroup(this, "SlowSearchLogs", {
      logGroupName: names.hyphenatedPrefix + "Logs/" + props.slowSearchLogs,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    this.tasksLogGroup = new logs.LogGroup(this, "TaskLogs", {
      logGroupName: names.hyphenatedPrefix + "Logs/" + props.taskLogs,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}

interface CombinedClusterLoggingProps {
  logGroupName: string
}
export class CombinedClusterLogging extends Construct {
  readonly logGroup: logs.LogGroup;
  readonly cwAgentConfigParam: ssm.StringParameter;

  constructor(
    parent: Construct,
    name: string,
    props: CombinedClusterLoggingProps
  ) {
    super(parent, name);

    const info = fromParams(this);
    const names = info.namesFor(this);

    this.logGroup = new logs.LogGroup(this, "Logs", {
      logGroupName: names.hyphenatedPrefix + "Logs/" + props.logGroupName,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
