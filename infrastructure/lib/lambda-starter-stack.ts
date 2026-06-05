import * as cdk from 'aws-cdk-lib';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import type { Construct } from 'constructs';
import { StarterLambdaFunction } from '../constructs/lambda-function.js';
import type { EnvironmentConfig } from './environment.js';

export interface LambdaStarterStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
}

export class LambdaStarterStack extends cdk.Stack {
  public constructor(scope: Construct, id: string, props: LambdaStarterStackProps) {
    super(scope, id, props);

    const appFunction = new StarterLambdaFunction(this, 'AppFunction', {
      codePath: 'dist/handlers',
      config: props.config,
      description: 'Initial API Gateway Lambda entry point for application code.',
      functionNameSuffix: 'app',
      handler: 'app.handler'
    });

    const healthFunction = new StarterLambdaFunction(this, 'HealthFunction', {
      codePath: 'dist/handlers',
      config: props.config,
      description: 'Operational health check Lambda handler.',
      functionNameSuffix: 'health',
      handler: 'health.handler'
    });

    const httpApi = new apigatewayv2.HttpApi(this, 'HttpApi', {
      apiName: `${props.config.serviceName}-${props.config.stageName}`,
      description: 'Sample HTTP API for the TypeScript Lambda starter.'
    });

    httpApi.addRoutes({
      integration: new integrations.HttpLambdaIntegration(
        'AppFunctionIntegration',
        appFunction.function
      ),
      methods: [apigatewayv2.HttpMethod.GET],
      path: '/'
    });

    httpApi.addRoutes({
      integration: new integrations.HttpLambdaIntegration(
        'HealthFunctionIntegration',
        healthFunction.function
      ),
      methods: [apigatewayv2.HttpMethod.GET],
      path: '/health'
    });

    new cdk.CfnOutput(this, 'AppFunctionName', {
      value: appFunction.function.functionName
    });

    new cdk.CfnOutput(this, 'HealthFunctionName', {
      value: healthFunction.function.functionName
    });

    new cdk.CfnOutput(this, 'HttpApiUrl', {
      value: httpApi.apiEndpoint
    });
  }
}
