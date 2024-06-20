import {
    aws_lambda as lambda,
    aws_route53 as r53,
    aws_certificatemanager as acm,
    aws_stepfunctions as sfn
  } from "aws-cdk-lib";
  import { Construct } from "constructs";
  import { AdmiralApiFunc } from './internal/AdmiralApiFunc';
  import { AdmiralApiEndpoint } from './internal/AdmiralApiEndpoint';
  import { AdmiralMachine } from './internal/AdmiralMachine';
  
  interface AdmiralApiProps {
    zone: r53.IPublicHostedZone,
    accountEmailDomainName: string,
    orgRootId: string,
    destinationOuId: string,
    orgRoleArn: string
  }
  
  export class AdmiralApi extends Construct {
    readonly func: lambda.Function;
    readonly machine: sfn.IStateMachine;
  
    constructor(parent: Construct, name: string, props: AdmiralApiProps) {
      super(parent, name);
  
        const apiFunc = new AdmiralApiFunc(this, 'Func', {
            accountEmailDomainName: props.accountEmailDomainName,
            orgRootId: props.orgRootId,
            destinationOuId: props.destinationOuId,
            orgRoleArn: props.orgRoleArn
        });
        const endpoint = new AdmiralApiEndpoint(this, 'Endpoint', {
            func: apiFunc.apiFunc,
            zone: props.zone
        });

        const m = new AdmiralMachine(this, 'Machine', {
          func: apiFunc.machineFunc,
        })
        this.machine = m.machine;
    }
  }
  