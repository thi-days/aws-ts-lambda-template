import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Context
} from 'aws-lambda';

export const createApiGatewayEvent = (
  overrides: Partial<APIGatewayProxyEventV2> = {}
): APIGatewayProxyEventV2 => ({
  headers: {},
  isBase64Encoded: false,
  rawPath: '/health',
  rawQueryString: '',
  requestContext: {
    accountId: '123456789012',
    apiId: 'local-api',
    domainName: 'localhost',
    domainPrefix: 'localhost',
    http: {
      method: 'GET',
      path: '/health',
      protocol: 'HTTP/1.1',
      sourceIp: '127.0.0.1',
      userAgent: 'jest'
    },
    requestId: 'request-id',
    routeKey: 'GET /health',
    stage: '$default',
    time: '16/Jun/2026:12:00:00 +0000',
    timeEpoch: 1781611200000
  },
  routeKey: 'GET /health',
  version: '2.0',
  ...overrides
});

export const createApiGatewayRouteEvent = (
  routeKey: string,
  path: string,
  overrides: Partial<APIGatewayProxyEventV2> = {}
): APIGatewayProxyEventV2 => {
  const baseEvent = createApiGatewayEvent();

  return createApiGatewayEvent({
    rawPath: path,
    requestContext: {
      ...baseEvent.requestContext,
      http: {
        ...baseEvent.requestContext.http,
        path
      },
      routeKey
    },
    routeKey,
    ...overrides
  });
};

export const createLambdaContext = (overrides: Partial<Context> = {}): Context => ({
  awsRequestId: 'aws-request-id',
  callbackWaitsForEmptyEventLoop: false,
  done: () => undefined,
  fail: () => undefined,
  functionName: 'aws-ts-lambda-template-health',
  functionVersion: '$LATEST',
  getRemainingTimeInMillis: () => 30_000,
  invokedFunctionArn:
    'arn:aws:lambda:us-east-1:123456789012:function:aws-ts-lambda-template-health',
  logGroupName: '/aws/lambda/aws-ts-lambda-template-health',
  logStreamName: '2026/06/16/[$LATEST]abcdef',
  memoryLimitInMB: '256',
  succeed: () => undefined,
  ...overrides
});

export const parseJsonBody = (response: APIGatewayProxyStructuredResultV2): unknown => {
  if (response.body === undefined) {
    throw new Error('Expected response body to be defined');
  }

  return JSON.parse(response.body);
};
