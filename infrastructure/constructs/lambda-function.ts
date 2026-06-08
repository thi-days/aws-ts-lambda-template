import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import type { EnvironmentConfig } from '../lib/environment.js';

export interface StarterLambdaFunctionProps {
  /** Directory containing built Lambda handler files. */
  codePath: string;
  /** Environment-specific Lambda settings. */
  config: EnvironmentConfig;
  /** Human-readable Lambda description. */
  description: string;
  /** Suffix appended to the stage-qualified function name. */
  functionNameSuffix: string;
  /** Lambda runtime handler string. */
  handler: string;
}

export class StarterLambdaFunction extends Construct {
  /** The Lambda function instance */
  public readonly function: lambda.Function;
  /** The CloudWatch log group for the Lambda function */
  public readonly logGroup: logs.LogGroup;

  public constructor(scope: Construct, id: string, props: StarterLambdaFunctionProps) {
    super(scope, id);

    const functionName = `${props.config.serviceName}-${props.config.stageName}-${props.functionNameSuffix}`;

    this.logGroup = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: `/aws/lambda/${functionName}`,
      removalPolicy: props.config.removalPolicy,
      retention: props.config.logRetention
    });

    this.function = new lambda.Function(this, 'Function', {
      applicationLogLevelV2: lambda.ApplicationLogLevel.INFO,
      architecture: lambda.Architecture.ARM_64,
      code: lambda.Code.fromAsset(props.codePath),
      description: props.description,
      environment: {
        // Source maps make bundled stack traces point back to the TypeScript source.
        NODE_OPTIONS: '--enable-source-maps',
        PARAMETER_PATH_PREFIX: props.config.parameterPathPrefix,
        POWERTOOLS_LOG_LEVEL: props.config.logLevel,
        POWERTOOLS_METRICS_NAMESPACE: props.config.metricsNamespace,
        POWERTOOLS_SERVICE_NAME: props.config.serviceName,
        STAGE: props.config.stageName
      },
      functionName,
      handler: props.handler,
      logGroup: this.logGroup,
      loggingFormat: lambda.LoggingFormat.JSON,
      memorySize: props.config.memorySize,
      runtime: lambda.Runtime.NODEJS_24_X,
      systemLogLevelV2: lambda.SystemLogLevel.INFO,
      timeout: props.config.timeout,
      tracing: lambda.Tracing.ACTIVE
    });

    this.grantParameterRead(props.config.parameterPathPrefix);
  }

  private grantParameterRead(parameterPathPrefix: string): void {
    const normalizedPath = parameterPathPrefix.replace(/^\/+/, '');

    this.function.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
          cdk.Stack.of(this).formatArn({
            resource: 'parameter',
            resourceName: `${normalizedPath}/*`,
            service: 'ssm'
          })
        ]
      })
    );
  }
}
