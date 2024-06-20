import { aws_route53 as r53 } from "aws-cdk-lib";
import * as ct from './CommonTypes';
import { ImportedZone } from "./ImportedZone";

export abstract class DnsZone {

    static fromZone = (z: r53.IPublicHostedZone): ct.IAccountFactoryZone => {
        return new ImportedZone(z);
    }

    static subdomainOfZone = (z: r53.IPublicHostedZone, subdomain?: string): ct.IAccountFactoryZone => {
        return new ImportedZone(z, subdomain);
    }
}

