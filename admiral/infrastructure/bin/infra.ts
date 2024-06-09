#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as stacks from '../lib';

const app = new cdk.App();
const env: cdk.Environment = {
  account: "533267097423",
  region: 'us-east-2'
};
const sp: cdk.StackProps = {
  env: env
}

const provisionerStack = new stacks.ProvisionerStack(app, "Provisioner", sp);
const registrarStack = new stacks.RegistrarStack(app, "Registrar", {
  managedAccountsOuId: 'ou-mx2e-7po8x0v1',
  env: { account: "905418336225", region: sp.env!.region},
});