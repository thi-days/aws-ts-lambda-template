import { describe, expect, it } from '@jest/globals';
import type { ApiErrorBody, ApiSuccessBody } from '../src/types/api.js';
import {
  badRequest,
  created,
  forbidden,
  internalServerError,
  notFound,
  ok,
  unauthorized
} from '../src/utils/http.js';
import { parseJsonBody } from './helpers/api-gateway.js';

describe('HTTP response helpers', () => {
  it('returns a standard success body', () => {
    const response = ok({ message: 'done' }, 'correlation-id');
    const body = parseJsonBody(response) as ApiSuccessBody;

    expect(response.statusCode).toBe(200);
    expect(response.headers).toMatchObject({
      'content-type': 'application/json',
      'x-correlation-id': 'correlation-id'
    });
    expect(body).toEqual({
      correlationId: 'correlation-id',
      data: { message: 'done' },
      success: true
    });
  });

  it('returns standard status codes for common responses', () => {
    expect(created({ id: '123' }).statusCode).toBe(201);
    expect(badRequest().statusCode).toBe(400);
    expect(unauthorized().statusCode).toBe(401);
    expect(forbidden().statusCode).toBe(403);
    expect(notFound().statusCode).toBe(404);
    expect(internalServerError().statusCode).toBe(500);
  });

  it('returns a standard error body', () => {
    const response = notFound('Order not found', 'correlation-id');
    const body = parseJsonBody(response) as ApiErrorBody;

    expect(body).toEqual({
      correlationId: 'correlation-id',
      error: {
        code: 'NOT_FOUND',
        message: 'Order not found'
      },
      success: false
    });
  });
});
