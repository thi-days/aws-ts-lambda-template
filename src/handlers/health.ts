import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context
} from 'aws-lambda';
import { withApiGatewayMiddleware } from '../middlewares/api-gateway.js';
import { logger } from '../observability/index.js';
import { getHealthStatus } from '../services/health-service.js';
import { getCorrelationId } from '../utils/correlation.js';
import { ok } from '../utils/http.js';

const healthHandler = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyStructuredResultV2> => {
  const healthStatus = getHealthStatus();
  const correlationId = getCorrelationId(event);

  logger.info('Health check requested', {
    awsRequestId: context.awsRequestId,
    correlationId
  });

  return ok(healthStatus, correlationId);
};

export const handler = withApiGatewayMiddleware(healthHandler, {
  operationName: 'health'
});
