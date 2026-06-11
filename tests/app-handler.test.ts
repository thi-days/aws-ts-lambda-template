import { describe, expect, it } from '@jest/globals';
import { handler } from '../src/handlers/app.js';
import type { ApiSuccessBody } from '../src/types/api.js';
import {
  createApiGatewayRouteEvent,
  createLambdaContext,
  parseJsonBody
} from './helpers/api-gateway.js';

describe('app handler', () => {
  it('returns the initial implementation reference response', async () => {
    const event = createApiGatewayRouteEvent('GET /', '/', {
      headers: {
        'x-correlation-id': 'client-correlation-id'
      }
    });

    const response = await handler(event, createLambdaContext());
    const body = parseJsonBody(response) as ApiSuccessBody<{ message: string; requestId: string; route: string }>;

    expect(response.statusCode).toBe(200);
    expect(response.headers).toMatchObject({
      'x-correlation-id': 'client-correlation-id'
    });
    expect(body).toEqual({
      correlationId: 'client-correlation-id',
      data: {
        message: 'Replace src/handlers/app.ts with your Lambda implementation.',
        requestId: 'aws-request-id',
        route: 'GET /'
      },
      success: true
    });
  });
});
