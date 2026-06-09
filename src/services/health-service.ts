import { getConfig } from '../config/index.js';

export interface HealthStatus {
  region: string;
  service: string;
  stage: string;
  status: 'ok';
  timestamp: string;
}

export const getHealthStatus = (now = new Date()): HealthStatus => {
  const config = getConfig();

  return {
    region: config.awsRegion,
    service: config.serviceName,
    stage: config.stage,
    status: 'ok',
    timestamp: now.toISOString()
  };
};
