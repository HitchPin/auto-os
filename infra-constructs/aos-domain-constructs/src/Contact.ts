import {
    aws_s3 as s3,
    aws_iam as iam,
    RemovalPolicy
} from 'aws-cdk-lib';
import { Construct } from "constructs";
import type { ContactDetail } from '@auto-os/opensearch-schemas';
import { RoBuilder, toRoBuilder } from '@auto-os/ro-builder';

export abstract class Contact {
  static fromValue(cd: ContactDetail): RoBuilder<ContactDetail, ContactDetail>  {
    return toRoBuilder<ContactDetail>(cd) as unknown as RoBuilder<ContactDetail, ContactDetail>;
  }
}

const Default_MessageFormatter = (wc: string) => `The '${wc}' method was invoked multiple times.`;
class WithMethodMultipleInvocationsError extends Error {
  constructor(witherName: string) {
    super(Default_MessageFormatter(witherName));
    this.name = 'WithMethodMultipleInvocationsError';
  }
}