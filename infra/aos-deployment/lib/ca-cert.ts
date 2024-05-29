import { Construct } from 'constructs';
import { CfnRootCA} from './generated';
import { Token, aws_kms as kms } from 'aws-cdk-lib';

type Subject = {
    commonName: string,
    state: string,
    city: string,
    country: string,
    org: string
}
interface AosRootCAProps {
  encryptionKey: kms.Key;
  subject: Subject;
  keySize: 1024 | 2048 | 4096,
  secretName: string
}

export class AosRootCA extends Construct {
  readonly ca: CfnRootCA;

  get privateKeySecretArn(): string {
    return Token.asString(this.ca.getAtt("PrivateKeySecretArn"));
  }

  get publicCertificatePem(): string {
    return Token.asString(this.ca.getAtt("PublicCertificatePem"));
  }
  
  constructor(parent: Construct, name: string, props: AosRootCAProps) {
    super(parent, name);

    this.ca = new CfnRootCA(this, "RootCA", {
      keySize: props.keySize,
      subject: {
        commonName: props.subject.commonName,
        state: props.subject.state,
        city: props.subject.city,
        country: props.subject.country,
        organization: props.subject.org,
      },
      privateKeySecretName: props.secretName,
      privateKeyKmsKeyId: props.encryptionKey.keyId,
    });
  }
}