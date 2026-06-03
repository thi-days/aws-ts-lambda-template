import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import middy, { type MiddlewareObj } from '@middy/core';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context
} from 'aws-lambda';
import { ValidationError, normalizeError } from '../errors/index.js';
import {
  addFailedRequestMetric,
  addSuccessfulRequestMetric,
  addValidationErrorMetric,
  logger,
  metrics,
  tracer
} from '../observability/index.js';
import { CORRELATION_ID_HEADER, getCorrelationId } from '../utils/correlation.js';
import { errorResponse } from '../utils/http.js';

export type ApiGatewayHandler = (
  event: APIGatewayProxyEventV2,
  context: Context
) => Promise<APIGatewayProxyStructuredResultV2>;

interface ApiGatewayMiddlewareOptions {
  logEvent?: boolean;
  operationName: string;
}

interface ApiGatewayInternalState extends Record<string, unknown> {
  correlationId?: string;
  startedAt?: number;
}

type ApiGatewayMiddleware = MiddlewareObj<
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Error,
  Context,
  ApiGatewayInternalState
>;

const addCorrelationHeader = (
  response: APIGatewayProxyStructuredResultV2 | null | undefined,
  correlationId: string | undefined
): void => {
  if (response === null || response === undefined || correlationId === undefined) {
    return;
  }

  response.headers = {
    ...(response.headers ?? {}),
    [CORRELATION_ID_HEADER]: correlationId
  };
};

const correlationIdMiddleware = (): ApiGatewayMiddleware => ({
  after: (request) => {
    addCorrelationHeader(request.response, request.internal.correlationId);
  },
  before: (request) => {
    const correlationId = getCorrelationId(request.event);

    request.internal.correlationId = correlationId;
    logger.setCorrelationId(correlationId);
    logger.appendKeys({ correlationId });
    tracer.putAnnotation('CorrelationId', correlationId);
  },
  name: 'correlationIdMiddleware'
});

const requestLifecycleMiddleware = (
  options: ApiGatewayMiddlewareOptions
): ApiGatewayMiddleware => ({
  after: (request) => {
    addSuccessfulRequestMetric();
    addCorrelationHeader(request.response, request.internal.correlationId);

    logger.info('Request completed', {
      operationName: options.operationName,
      statusCode: request.response?.statusCode
    });
  },
  before: (request) => {
    request.internal.startedAt = Date.now();

    logger.info('Request started', {
      method: request.event.requestContext.http.method,
      operationName: options.operationName,
      path: request.event.rawPath
    });
  },
  name: 'requestLifecycleMiddleware'
});

const errorNormalizationMiddleware = (): ApiGatewayMiddleware => ({
  name: 'errorNormalizationMiddleware',
  onError: (request) => {
    const error = normalizeError(request.error);

    addFailedRequestMetric();

    if (error instanceof ValidationError) {
      addValidationErrorMetric();
    }

    logger.error('Request failed', error);

    request.response = errorResponse(error, request.internal.correlationId);
    request.error = null;
  }
});

export const withApiGatewayMiddleware = (
  handler: ApiGatewayHandler,
  options: ApiGatewayMiddlewareOptions
): ApiGatewayHandler =>
  middy(handler)
    .use(
      logMetrics(metrics, {
        captureColdStartMetric: true,
        throwOnEmptyMetrics: false
      })
    )
    .use(captureLambdaHandler(tracer, { captureResponse: false }))
    .use(
      injectLambdaContext(logger, {
        logEvent: options.logEvent ?? false,
        resetKeys: true
      })
    )
    .use(correlationIdMiddleware())
    .use(requestLifecycleMiddleware(options))
    .use(errorNormalizationMiddleware());
