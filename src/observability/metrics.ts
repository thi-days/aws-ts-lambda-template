import { MetricUnit, Metrics } from '@aws-lambda-powertools/metrics';
import { getConfig } from '../config/index.js';

const config = getConfig();

type MetricUnitValue = (typeof MetricUnit)[keyof typeof MetricUnit];

const defaultMetricDimensions = {
  stage: config.stage
} as const;

export const metrics = new Metrics({
  defaultDimensions: defaultMetricDimensions,
  namespace: config.metricsNamespace,
  serviceName: config.serviceName
});

export const getDefaultMetricDimensions = (): Record<string, string> => defaultMetricDimensions;

export const addSuccessfulRequestMetric = (): void => {
  metrics.addMetric('SuccessfulRequests', MetricUnit.Count, 1);
};

export const addFailedRequestMetric = (): void => {
  metrics.addMetric('FailedRequests', MetricUnit.Count, 1);
};

export const addValidationErrorMetric = (): void => {
  metrics.addMetric('ValidationErrors', MetricUnit.Count, 1);
};

export const addCustomMetric = (
  name: string,
  value: number,
  unit: MetricUnitValue = MetricUnit.Count
): void => {
  metrics.addMetric(name, unit, value);
};
