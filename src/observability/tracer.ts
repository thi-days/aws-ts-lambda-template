import { Tracer } from '@aws-lambda-powertools/tracer';
import { getConfig } from '../config/index.js';

const config = getConfig();

export const tracer = new Tracer({
  serviceName: config.serviceName
});
