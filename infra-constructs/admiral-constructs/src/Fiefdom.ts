import {
  aws_organizations as org,
  aws_iam as iam,
  custom_resources as cr,
} from "aws-cdk-lib";
import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { FiefdomPrereqs } from './internal/FiefdomPrereqs';

interface FiefProps {
  readonly delegatedAdmin: org.CfnAccount;
  readonly loggingAccount: org.CfnAccount;
  readonly securityAccount: org.CfnAccount;
}

export class Fief extends Construct {

  constructor(parent: Construct, name: string, props: FiefProps) {
    super(parent, name);

    new FiefdomPrereqs(this, 'Prereqs');
  }
}
