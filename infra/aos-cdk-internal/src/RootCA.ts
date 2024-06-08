import { Construct } from "constructs";
import {
    aws_kms as kms,
    aws_secretsmanager as sm,
    Duration,
    Names,
    Token
} from 'aws-cdk-lib';
import * as gen from './generated';

export enum RootCAKeySize {
  Bits1024 = 1024,
  Bits2048 = 2048,
  Bits4096 = 4096,
}

export type Subject = {
  commonName: string;
  country: string;
  stateOrProvince: string;
  city: string;
  organization: string;
  organizationUnit?: string;
}

export interface RootCAProps {
  subject: Subject;
  secretName?: string;
  encryptionKey?: kms.IKey;
  expiration?: Duration;
  keySize?: RootCAKeySize;
}

export interface IRootCA {
  readonly encryptionKey: kms.IKey;
  readonly publicCertificatePem: string;
  readonly privateKeySecretArn: string;
  readonly serial: string;
  readonly rootCaId: string;
}

export class RootCA extends Construct implements IRootCA {
  private readonly cfnProps: gen.CfnRootCAProps;
  private readonly cfnResource: gen.CfnRootCA;

  readonly encryptionKey: kms.IKey;
  readonly materialsSecret: sm.ISecret;

  constructor(parent: Construct, name: string, props: RootCAProps) {
    super(parent, name);

    validateProps(props);

    if (!props.encryptionKey) {
      this.encryptionKey = new kms.Key(this, "EncryptionKey", {
        alias: `${name}-hp-autoos-rootca-key`,
        description: `Encryption key for the RootCA secret for ${name}.`,
      });
    } else {
      this.encryptionKey = props.encryptionKey!;
    }

    let secretName: string;
    let keySize: number | undefined = undefined;
    let expirationDays: number | undefined = undefined;

    if (props.secretName) {
      secretName = props.secretName!;
    } else {
      secretName = Names.uniqueResourceName(this, {
        allowedSpecialCharacters: "/-",
      });
    }
    if (props.keySize) {
      keySize = props.keySize.valueOf();
    }
    if (props.expiration) {
      expirationDays = props.expiration!.toDays();
    }

    const s = props.subject;
    this.cfnProps = {
      subject: {
        commonName: s.commonName,
        country: s.country,
        state: s.stateOrProvince,
        city: s.city,
        organization: s.organization,
        organizationalUnit: s.organizationUnit,
      },
      privateKeySecretName: secretName,
      keySize: keySize,
      expirationDays: expirationDays,
      privateKeyKmsKeyId: this.encryptionKey.keyId,
    };
    this.cfnResource = new gen.CfnRootCA(this, "Resource", this.cfnProps);

    this.materialsSecret = sm.Secret.fromSecretCompleteArn(this, 'MaterialsSecret', this.privateKeySecretArn);
  }

  get publicCertificatePem(): string {
    return Token.asString(this.cfnResource.getAtt("PublicCertificatePem"));
  }
  get serial(): string {
    return Token.asString(this.cfnResource.getAtt("Serial"));
  }
  get privateKeySecretArn(): string {
    return Token.asString(this.cfnResource.getAtt("PrivateKeySecretArn"));
  }
  get rootCaId(): string {
    return Token.asString(this.cfnResource.ref);
  }
}

function validateProps(p: RootCAProps) {
    validateSubject(p.subject);
    if (p.keySize && ![1024, 2048, 4096].includes(p.keySize?.valueOf())) {
        throw new Error('KeySize must be 1024, 2048, or 4096.');
    }
}

function validateSubject(subject: Subject) {
    const required: (keyof Subject)[] = [
        'commonName',
        'city',
        'stateOrProvince',
        'country',
        'organization'
    ]
    required.forEach(k => {
        if (!subject[k]) {
            throw new Error(`Subject property 'commonName' is required.`);
        }
    });
}