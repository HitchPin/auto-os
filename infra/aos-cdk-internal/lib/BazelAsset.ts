import {
    aws_s3_assets as s3a,
    aws_lambda as lambda
} from 'aws-cdk-lib';
import * as bzl from './util';

interface BazelOptions {
    customBazelPath?: string,
    workspaceRoot?: string,
}
interface BazelAssetProps {
    package: string,
    target?: string,
    bazez?: BazelOptions
}
 

export class BazelLambdaCode extends lambda.AssetCode {
    constructor(packagePath: string, target?: string) {
        const b = new bzl.BazelClient();
        const parts =packagePath.split('/');
        const realTarget = target ?? parts[parts.length - 1];
        const p = b.artifactOf(packagePath, realTarget);
        super(p)
    }
}
