import {
    aws_codeartifact as ca,
} from 'aws-cdk-lib';
import * as ch from 'construct-hub';
import { Construct } from 'constructs';

interface AutoOsConstructHubProps {
    constructRepository: ca.CfnRepository;
}

export class AutoOsConstructHub extends Construct {

    constructor(parent: Construct, name: string, props: AutoOsConstructHubProps) {
        super(parent, name);

        new ch.ConstructHub(this, 'Constructs', {
            packageSources: [
                new ch.sources.CodeArtifact({
                     repository: props.constructRepository
                }),
              ],
        });
    }
}