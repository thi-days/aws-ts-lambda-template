import { describe, expect, it } from '@jest/globals';
import { loadConfig } from '../src/config/index.js';

describe('loadConfig', () => {
  it('applies safe defaults for local development', () => {
    const config = loadConfig({});

    expect(config).toEqual({
      awsRegion: 'us-east-1',
      logLevel: 'INFO',
      metricsNamespace: 'AwsTsLambdaTemplate',
      parameterPathPrefix: '/aws-ts-lambda-template/dev',
      serviceName: 'aws-ts-lambda-template',
      stage: 'dev'
    });
  });

  it('returns type-safe values from environment variables', () => {
    const config = loadConfig({
      AWS_REGION: 'eu-west-1',
      PARAMETER_PATH_PREFIX: '/orders/production',
      POWERTOOLS_LOG_LEVEL: 'WARN',
      POWERTOOLS_METRICS_NAMESPACE: 'Orders',
      POWERTOOLS_SERVICE_NAME: 'orders-api',
      STAGE: 'production'
    });

    expect(config).toEqual({
      awsRegion: 'eu-west-1',
      logLevel: 'WARN',
      metricsNamespace: 'Orders',
      parameterPathPrefix: '/orders/production',
      serviceName: 'orders-api',
      stage: 'production'
    });
  });

  it('fails fast for invalid configuration', () => {
    expect(() =>
      loadConfig({
        POWERTOOLS_LOG_LEVEL: 'verbose',
        STAGE: 'qa'
      })
    ).toThrow();
  });
});
