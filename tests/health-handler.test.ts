import { describe, expect, it } from '@jest/globals';
import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { ValidationError } from '../src/errors/index.js';
import { handler } from '../src/handlers/health.js';
import { withApiGatewayMiddleware } from '../src/middlewares/api-gateway.js';
import type { ApiErrorBody, ApiSuccessBody } from '../src/types/api.js';
import {
  createApiGatewayEvent,
  createLambdaContext,
  parseJsonBody
} from './helpers/api-gateway.js';

describe('health handler', () => {
  it('returns health status with explicit correlation propagation', async () => {
    const event = createApiGatewayEvent({
      headers: {
        'x-correlation-id': 'client-correlation-id'
      }
    });

    const response = await handler(event, createLambdaContext());
    const body = parseJsonBody(response) as ApiSuccessBody;

    expect(response.statusCode).toBe(200);
    expect(response.headers).toMatchObject({
      'x-correlation-id': 'client-correlation-id'
    });
    expect(body).toMatchObject({
      correlationId: 'client-correlation-id',
      data: {
        region: 'us-east-1',
        service: 'typescript-lambda-starter',
        stage: 'test',
        status: 'ok'
      },
      success: true
    });
  });

  it('normalizes application errors into API Gateway responses', async () => {
    const failingHandler = withApiGatewayMiddleware(
      async (): Promise<APIGatewayProxyStructuredResultV2> => {
        throw new ValidationError('Missing required field', { field: 'name' });
      },
      {
        operationName: 'failing-test'
      }
    );

    const response = await failingHandler(createApiGatewayEvent(), createLambdaContext());
    const body = parseJsonBody(response) as ApiErrorBody;

    expect(response.statusCode).toBe(400);
    expect(response.headers).toMatchObject({
      'x-correlation-id': 'request-id'
    });
    expect(body).toEqual({
      correlationId: 'request-id',
      error: {
        code: 'VALIDATION_ERROR',
        details: { field: 'name' },
        message: 'Missing required field'
      },
      success: false
    });
  });
});
