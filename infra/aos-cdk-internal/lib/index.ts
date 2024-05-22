// import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface AosCdkInternalProps {
  // Define construct properties here
}

export class AosCdkInternal extends Construct {

  constructor(scope: Construct, id: string, props: AosCdkInternalProps = {}) {
    super(scope, id);

    // Define construct contents here

    // example resource
    // const queue = new sqs.Queue(this, 'AosCdkInternalQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
