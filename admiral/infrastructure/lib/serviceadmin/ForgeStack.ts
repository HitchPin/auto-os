import { 
  aws_kms as kms
} from 'aws-cdk-lib';
import * as cdk from "aws-cdk-lib";
import * as amiConstructs from "../../../../infra-constructs/aos-ami-constructs/dist";
import { OrgSharedKmsKey } from "../../../../infra-constructs/admiral-constructs/dist";

interface ForgeStackProps {
    env: cdk.Environment,
}

export class ForgeStack extends cdk.Stack {
  readonly ami: amiConstructs.BakedAmi;
  readonly amiEncryptionKey: kms.IKey;

  constructor(parent: cdk.App, name: string, props: ForgeStackProps) {
    super(parent, name, props);

    this.amiEncryptionKey = new OrgSharedKmsKey(this, 'AmiKey', {
      alias: 'forged-ami-key'
    })
    
    this.ami = new amiConstructs.BakedAmi(this, 'Ami', {
      encryptionKey: this.amiEncryptionKey
    });
  }
}
