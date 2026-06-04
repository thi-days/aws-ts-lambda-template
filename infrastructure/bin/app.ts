#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { getEnvironmentConfig } from '../lib/environment.js';
import { LambdaStarterStack } from '../lib/lambda-starter-stack.js';

const app = new cdk.App();
const stageContext: unknown = app.node.tryGetContext('stage');
const stageName = typeof stageContext === 'string' ? stageContext : process.env.STAGE;
const config = getEnvironmentConfig(stageName);

new LambdaStarterStack(app, `${config.serviceName}-${config.stageName}`, {
  config,
  description: `TypeScript Lambda starter (${config.stageName})`
});
