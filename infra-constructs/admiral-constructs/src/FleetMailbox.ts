import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import {
  aws_iam as iam,
  aws_lambda as lambda,
  aws_s3 as s3,
  aws_ses as ses,
  aws_ses_actions as sesActions,
  aws_route53 as r53,
  aws_logs as logs,
  aws_events as evts,
  aws_events_targets as evtTargets
} from "aws-cdk-lib";
import { VerifySesDomain } from '@seeebiii/ses-verify-identities'
import * as path from 'path';
import { RuleSetActivator } from './internal/RuleSetActivator';

const getBazelHandlerPath = (): string => {
  return path.join(
    __dirname,
    "../dist/handlers/account-mail-processor/package.zip"
  );
}

interface FleetMailboxProps {
  zone: r53.IPublicHostedZone,
  admiralEventBus: evts.EventBus 
  bucket?: s3.IBucket,
  prefix?: string,
  domainName: string
}

export class FleetMailbox extends Construct {

  readonly verification: VerifySesDomain;
  readonly func: lambda.Function;
  readonly storageBucket: s3.IBucket;
  readonly mailLogs: logs.LogGroup;

  constructor(parent: Construct, name: string, props: FleetMailboxProps) {
    super(parent, name);

    this.verification = new VerifySesDomain(this, 'DomainVerification', {
      hostedZoneId: props.zone.hostedZoneId,
      hostedZoneName: props.zone.zoneName,
      addDkimRecords: true,
      addMxRecord: true,
      addTxtRecord: true,
      domainName: props.domainName
    });

    this.storageBucket = props.bucket ?? new s3.Bucket(this, 'MailBucket', {

    });

    this.func = new lambda.Function(this, 'Func', {
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(15),
      handler: 'index.handle',
      code: lambda.Code.fromAsset(getBazelHandlerPath()),
      environment: {
        'BUCKET': this.storageBucket.bucketName,
        'PREFIX': props.prefix ?? '',
        'DOMAIN': props.domainName,
        'EVENT_BUS': props.admiralEventBus.eventBusName
      }
    });

    const rsrcs: string[] = [];
    if (props.prefix) {
      rsrcs.push(this.storageBucket.arnForObjects(props.prefix!));
    } else {
      rsrcs.push(this.storageBucket.bucketArn);
      rsrcs.push(this.storageBucket.arnForObjects('*'));
    }
    this.func.addToRolePolicy(new iam.PolicyStatement({
      actions: ['s3:Put*', 's3:Get*', 's3:List*'],
      resources: rsrcs
    }));
    this.func.addToRolePolicy(new iam.PolicyStatement({
      actions: ['events:PutEvents'],
      resources: [ props.admiralEventBus.eventBusArn ]
    }));


    const rrSet = new ses.ReceiptRuleSet(this, 'RRS', {
      rules: [
        {
          actions: [
            new sesActions.Lambda({
              function: this.func
            })
          ]
        }
      ]
    });
    new RuleSetActivator(this, 'Activator', {
      rs: rrSet
    });

    this.mailLogs = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: 'FleetMail'
    });
    const emailRule = new evts.Rule(this, 'Rule', {
      eventBus: props.admiralEventBus,
      eventPattern: {
        source: ['admiral.tenant-mailbox'],
        detailType: ['Tenant AWS Account Email Received']
      }
    });
    emailRule.addTarget(new evtTargets.CloudWatchLogGroup(this.mailLogs));
  }
}