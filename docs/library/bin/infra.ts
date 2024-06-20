#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as stacks from '../lib';

const app = new cdk.App();
const env: cdk.Environment = {
  account: "767397695587",
  region: 'us-east-2'
};

const library = new stacks.LibraryStack(app, "Library", {
  env: env
});