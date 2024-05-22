import { aws_lambda as lambda } from 'aws-cdk-lib';
export declare class BazelLambdaCode extends lambda.AssetCode {
    constructor(packagePath: string, target?: string);
}
