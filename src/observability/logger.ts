import { Logger } from '@aws-lambda-powertools/logger';
import { getConfig } from '../config/index.js';

const config = getConfig();

export const logger = new Logger({
  logLevel: config.logLevel,
  serviceName: config.serviceName
});
