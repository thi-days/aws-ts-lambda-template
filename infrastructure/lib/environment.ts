import * as cdk from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';

export type StageName = 'dev' | 'production' | 'staging';

export interface EnvironmentConfig {
  logLevel: 'DEBUG' | 'INFO' | 'WARN';
  logRetention: logs.RetentionDays;
  memorySize: number;
  metricsNamespace: string;
  parameterPathPrefix: string;
  removalPolicy: cdk.RemovalPolicy;
  serviceName: string;
  stageName: StageName;
  timeout: cdk.Duration;
}

const serviceName = 'typescript-lambda-starter';

export const environmentConfigs: Record<StageName, EnvironmentConfig> = {
  dev: {
    logLevel: 'DEBUG',
    logRetention: logs.RetentionDays.ONE_WEEK,
    memorySize: 256,
    metricsNamespace: 'TypeScriptLambdaStarter',
    parameterPathPrefix: `/${serviceName}/dev`,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    serviceName,
    stageName: 'dev',
    timeout: cdk.Duration.seconds(10)
  },
  production: {
    logLevel: 'INFO',
    logRetention: logs.RetentionDays.SIX_MONTHS,
    memorySize: 512,
    metricsNamespace: 'TypeScriptLambdaStarter',
    parameterPathPrefix: `/${serviceName}/production`,
    removalPolicy: cdk.RemovalPolicy.RETAIN,
    serviceName,
    stageName: 'production',
    timeout: cdk.Duration.seconds(10)
  },
  staging: {
    logLevel: 'INFO',
    logRetention: logs.RetentionDays.ONE_MONTH,
    memorySize: 256,
    metricsNamespace: 'TypeScriptLambdaStarter',
    parameterPathPrefix: `/${serviceName}/staging`,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    serviceName,
    stageName: 'staging',
    timeout: cdk.Duration.seconds(10)
  }
};

const isStageName = (value: string): value is StageName =>
  Object.hasOwn(environmentConfigs, value);

export const getEnvironmentConfig = (stageName: string | undefined): EnvironmentConfig => {
  const requestedStageName = stageName ?? 'dev';

  if (!isStageName(requestedStageName)) {
    throw new Error(
      `Unknown stage "${requestedStageName}". Expected one of: ${Object.keys(environmentConfigs).join(', ')}`
    );
  }

  return environmentConfigs[requestedStageName];
};
