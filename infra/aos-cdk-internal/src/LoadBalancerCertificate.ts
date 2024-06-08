import { Construct } from "constructs";
import {
  aws_kms as kms,
  aws_certificatemanager as acm,
  aws_secretsmanager as sm,
  Duration,
  Names,
  Token,
} from "aws-cdk-lib";
import * as gen from './generated';
import type { IRootCA } from './RootCA';

export enum LoadBalancerCertificateKeySize {
  Bits1024 = 1024,
  Bits2048 = 2048,
  Bits4096 = 4096,
}

export interface LoadBalancerCertificateProps {
  commonName: string;
  rootCA: IRootCA;
  expiration?: Duration;
  keySize?: LoadBalancerCertificateKeySize;
}

export interface ILoadBalancerCertificate {
  readonly certificate: acm.ICertificate;
}

export class LoadBalancerCertificate
  extends Construct
  implements ILoadBalancerCertificate
{
  private readonly cfnProps: gen.CfnLbCertificateProps;
  private readonly cfnResource: gen.CfnLbCertificate;

  readonly certificate: acm.ICertificate;

  constructor(
    parent: Construct,
    name: string,
    props: LoadBalancerCertificateProps
  ) {
    super(parent, name);

    let keySize: number | undefined = undefined;
    let expirationDays: number | undefined = undefined;

    if (props.keySize) {
      keySize = props.keySize.valueOf();
    }
    if (props.expiration) {
      expirationDays = props.expiration!.toDays();
    }

    this.cfnProps = {
      commonName: props.commonName,
      keySize: keySize,
      expirationDays: expirationDays,
      rootCaSecretId: props.rootCA.privateKeySecretArn
    };
    this.cfnResource = new gen.CfnLbCertificate(this, "Resource", this.cfnProps);

    this.certificate = acm.Certificate.fromCertificateArn(
      this,
      "LbCert",
      this.cfnResource.attrAcmCertificateId
    );
  }
}