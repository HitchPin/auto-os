#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AosAssemblyPrereqStack } from '../lib/aos-assembly-prereq-stack';

const app = new cdk.App();
new AosAssemblyPrereqStack(app, "AosAssemblyPrereqStack", {
  env: {
    account: "609912790087",
    region: "us-west-2",
  },
});