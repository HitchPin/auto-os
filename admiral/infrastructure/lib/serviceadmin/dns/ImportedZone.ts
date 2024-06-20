import { aws_route53 as r53 } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ct from './CommonTypes';

export class ImportedZone implements ct.IAccountFactoryZone {
    readonly #zone: r53.IPublicHostedZone;
    readonly #subdomain?: string;
    constructor(z: r53.IPublicHostedZone, subdomain?: string) {
        this.#zone = z;
        this.#subdomain = subdomain;
    }

    bind = (c: Construct): ct.IDomainInfo => {
        if (!this.#subdomain) {
            return {
                zone: this.#zone
            }
        } else {
            const totalDomain = this.#zone.zoneName + this.#subdomain!;
            const subdomain = new r53.HostedZone(c, 'Zone', {
                zoneName: totalDomain,
            });
            new r53.ZoneDelegationRecord(c, 'DelegationRecord', {
                zone: subdomain,
                recordName: this.#subdomain,
                nameServers: subdomain.hostedZoneNameServers!
            });
            return {
                zone: subdomain
            }
        }
    };
}