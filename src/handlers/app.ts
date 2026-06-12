import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context
} from 'aws-lambda';
import { withApiGatewayMiddleware } from '../middlewares/api-gateway.js';
import { logger } from '../observability/index.js';
import { getCorrelationId } from '../utils/correlation.js';
import { ok } from '../utils/http.js';

const appHandler = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyStructuredResultV2> => {
  const correlationId = getCorrelationId(event);

  logger.info('Application request received', {
    awsRequestId: context.awsRequestId,
    correlationId,
    routeKey: event.routeKey
  });

  // Replace this block with your first application use case.
  return ok(
    {
      message: 'Replace src/handlers/app.ts with your Lambda implementation.',
      requestId: context.awsRequestId,
      route: event.routeKey
    },
    correlationId
  );
};

export const handler = withApiGatewayMiddleware(appHandler, {
  operationName: 'app'
});
