#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { getEnvironmentConfig } from '../lib/environment.js';
import { AwsTsLambdaTemplateStack } from '../lib/aws-ts-lambda-template-stack.js';

const app = new cdk.App();
const stageContext: unknown = app.node.tryGetContext('stage');
const stageName = typeof stageContext === 'string' ? stageContext : process.env.STAGE;
const config = getEnvironmentConfig(stageName);

new AwsTsLambdaTemplateStack(app, `${config.serviceName}-${config.stageName}`, {
  config,
  description: `AWS TypeScript Lambda template (${config.stageName})`
});
