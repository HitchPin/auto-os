import { Construct } from "constructs";
import {
    aws_s3 as s3,
    aws_s3_deployment as s3deploy
} from 'aws-cdk-lib';
import * as path from 'path';

interface ConfigAssetsProps {
    configBucket: s3.IBucket,
    configPrefix: string
}

export class ConfigAssets extends Construct {
  constructor(parent: Construct, name: string, props: ConfigAssetsProps)  {
    super(parent, name);

    new s3deploy.BucketDeployment(this, 'Deployment', {
        destinationBucket: props.configBucket,
        destinationKeyPrefix: props.configPrefix,
        sources: [
            s3deploy.Source.asset(path.resolve(__dirname, './configs'))
        ]
    });
  }
}