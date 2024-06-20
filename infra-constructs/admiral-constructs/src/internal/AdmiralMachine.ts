import {
    aws_stepfunctions as sfn,
    aws_stepfunctions_tasks as sfnTasks,
    aws_lambda as lambda,
    aws_iam as iam,
    Duration
} from 'aws-cdk-lib';
import { Succeed } from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';

interface AdmiralMachineProps {
    func: lambda.IFunction,
}

export class AdmiralMachine extends Construct {

    readonly machine: sfn.IStateMachine;

    constructor(parent: Construct, name: string, props: AdmiralMachineProps) {
        super(parent, name);

        const machineRole = new iam.Role(this, 'Role', {
            assumedBy: new iam.ServicePrincipal('states.amazonaws.com')
        });
        props.func.grantInvoke(machineRole);
        const retryProps: sfn.RetryProps = {
            backoffRate: 2,
            maxAttempts: 5,
            maxDelay: Duration.minutes(1)
        };

        const s = new sfn.Succeed(this, 'Success', {});

        const createBeaconTask = new sfnTasks.LambdaInvoke(this, 'CreateBeacon', {
            lambdaFunction: props.func,
            payloadResponseOnly: true
        }).addRetry(retryProps);
        const createLocalPortfolioTask = new sfnTasks.LambdaInvoke(this, 'Create Local Portfolio', {
            lambdaFunction: props.func,
            payloadResponseOnly: true
        }).addRetry(retryProps);
        const listProductsToCopyTask = new sfnTasks.LambdaInvoke(this, 'List Products to Copy', {
            lambdaFunction: props.func,
            payloadResponseOnly: true
        }).addRetry(retryProps);
        const copyProductTask = new sfnTasks.LambdaInvoke(this, 'Copy Product', {
            lambdaFunction: props.func,
            payloadResponseOnly: true
        }).addRetry(retryProps);
        
        const getCopyProductStatus = new sfnTasks.LambdaInvoke(this, 'Get copy product status', {
            lambdaFunction: props.func,
            payloadResponseOnly: true
        }).addRetry(retryProps);
        
        const pause = new sfn.Wait(this, 'Waiter', {
            time: sfn.WaitTime.duration(Duration.seconds(5))
        });
        pause.next(getCopyProductStatus);

        const associateProductWithPortfolio = new sfnTasks.LambdaInvoke(this, 'Associate product with portfolio', {
            lambdaFunction: props.func,
            payloadResponseOnly: true
        }).addRetry(retryProps);

        const associatePrincipal = new sfnTasks.LambdaInvoke(this, 'Associate Principal', {
            lambdaFunction: props.func,
            payloadResponseOnly: true
        }).addRetry(retryProps);
        associatePrincipal.next(s);

        const isLastProduct = sfn.Condition.stringEquals(sfn.JsonPath.stringAt('$.step'), 'AssociatePrincipal');
        const lastProductChoice = new sfn.Choice(this, 'IsLastProduct', {})
            .when(isLastProduct, associatePrincipal)
            .otherwise(copyProductTask);
        
        associateProductWithPortfolio.next(lastProductChoice)

        const keepCheckingCopyStatus = sfn.Condition.stringEquals(sfn.JsonPath.stringAt('$.step'), 'CheckCopyProductStatus');
        const keepCheckingStatusChoice = new sfn.Choice(this, 'IsCheckStatus', {})
            .when(keepCheckingCopyStatus, pause)
            .otherwise(associateProductWithPortfolio);
            

        const body = sfn.Chain.start(createBeaconTask)
            .next(createLocalPortfolioTask)
            .next(listProductsToCopyTask)
            .next(copyProductTask)
            .next(getCopyProductStatus)
            .next(keepCheckingStatusChoice)

        this.machine = new sfn.StateMachine(this, 'Machine', {
            definitionBody: sfn.DefinitionBody.fromChainable(body),
            stateMachineName: 'AdmiralAccountFactory'
        })
    }
}