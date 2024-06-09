import {
    aws_organizations as org
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cdk from 'aws-cdk-lib';
import * as admiralConstructs from "../../../../infra-constructs/admiral-constructs/dist";


export class ProvisionerStack extends cdk.Stack {

    readonly fleet: admiralConstructs.AdmiralFleet;

    constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
        super(parent, name, props);

        this.fleet = new admiralConstructs.AdmiralFleet(this, 'Fleet', {
            trustedServices: [
                'AccountManagement',
                //'Config', Control tower sets this up for us
                //'ControlTower', not yet 
                'SSO',
                'ServiceCatalog',
                'StackSets',
                'SystemsManager'
            ],
            emailPrefix: 'johnathan',
            domainName: 'hitchpin.com',
            accountsNames: {
                delegatedAdmin: 'auto-os-administration',
                logging: 'auto-os-logging',
                security: 'auto-os-security'
            }
        });

        new cdk.CfnOutput(this, 'OrganizationId', {
            value: this.fleet.organization.attrId
        });
        new cdk.CfnOutput(this, "ClusterAccountsOuId", {
          value: this.fleet.clusterAccountsOu.attrId,
        });
    }
}