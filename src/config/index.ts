import { z } from 'zod';

const logLevelSchema = z
  .enum(['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL', 'SILENT'])
  .default('INFO');

const stageSchema = z.enum(['dev', 'staging', 'production', 'test']).default('dev');

const environmentSchema = z.object({
  AWS_REGION: z.string().min(1).default('us-east-1'),
  PARAMETER_PATH_PREFIX: z.string().min(1).default('/aws-ts-lambda-template/dev'),
  POWERTOOLS_LOG_LEVEL: logLevelSchema,
  POWERTOOLS_METRICS_NAMESPACE: z.string().min(1).default('AwsTsLambdaTemplate'),
  POWERTOOLS_SERVICE_NAME: z.string().min(1).default('aws-ts-lambda-template'),
  STAGE: stageSchema
});

export interface AppConfig {
  awsRegion: string;
  logLevel: z.infer<typeof logLevelSchema>;
  metricsNamespace: string;
  parameterPathPrefix: string;
  serviceName: string;
  stage: z.infer<typeof stageSchema>;
}

let cachedConfig: AppConfig | undefined;

export const loadConfig = (environment: NodeJS.ProcessEnv = process.env): AppConfig => {
  const parsedEnvironment = environmentSchema.parse(environment);

  return {
    awsRegion: parsedEnvironment.AWS_REGION,
    logLevel: parsedEnvironment.POWERTOOLS_LOG_LEVEL,
    metricsNamespace: parsedEnvironment.POWERTOOLS_METRICS_NAMESPACE,
    parameterPathPrefix: parsedEnvironment.PARAMETER_PATH_PREFIX,
    serviceName: parsedEnvironment.POWERTOOLS_SERVICE_NAME,
    stage: parsedEnvironment.STAGE
  };
};

export const getConfig = (): AppConfig => {
  // Keep config lazy so tests and local scripts can set env vars before first use.
  cachedConfig ??= loadConfig();

  return cachedConfig;
};

export const resetConfigForTests = (): void => {
  cachedConfig = undefined;
};
