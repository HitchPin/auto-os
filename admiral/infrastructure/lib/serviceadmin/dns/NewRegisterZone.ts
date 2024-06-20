import { aws_route53 as r53 } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ct from './CommonTypes';


export class NewRegisterZone implements ct.IAccountFactoryZone {
    readonly #zone: r53.IPublicHostedZone;
    constructor(z: r53.IPublicHostedZone) {
        this.#zone = z;
    }

    bind = (c: Construct): ct.IDomainInfo => {
        return {
            zone: this.#zone
        }
    };
}