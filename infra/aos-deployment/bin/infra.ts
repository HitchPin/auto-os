#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AosDeploymentStack } from '../lib/aos-deployment-stack';

const app = new cdk.App();
new AosDeploymentStack(app, "AosDeploymentStack", {
  env: {
    account: "609912790087",
    region: "us-west-2",
  },
});