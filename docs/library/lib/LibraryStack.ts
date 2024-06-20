import * as cdk from 'aws-cdk-lib';
import { AutoOsConstructHub } from './AutoOsConstructHub';

export class LibraryStack extends cdk.Stack {
    constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
        super(parent, name);

        /*
        new AutoOsConstructHub(this, '', {
            constructRepository: 
        });
        */
    }
}