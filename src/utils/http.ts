import type { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import type { ApplicationError } from '../errors/index.js';
import {
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError
} from '../errors/index.js';
import type { ApiErrorBody, ApiSuccessBody } from '../types/api.js';
import { CORRELATION_ID_HEADER } from './correlation.js';

const jsonHeaders = {
  'content-type': 'application/json'
} as const;

const createSuccessBody = <TData>(data: TData, correlationId?: string): ApiSuccessBody<TData> => {
  const body: ApiSuccessBody<TData> = {
    data,
    success: true
  };

  if (correlationId !== undefined) {
    body.correlationId = correlationId;
  }

  return body;
};

const createErrorBody = (error: ApplicationError, correlationId?: string): ApiErrorBody => {
  const body: ApiErrorBody = {
    error: {
      code: error.code,
      message: error.message
    },
    success: false
  };

  if (error.details !== undefined) {
    body.error.details = error.details as Record<string, unknown>;
  }

  if (correlationId !== undefined) {
    body.correlationId = correlationId;
  }

  return body;
};

export const jsonResponse = (
  statusCode: number,
  body: unknown,
  correlationId?: string
): APIGatewayProxyStructuredResultV2 => {
  const headers: Record<string, string> = {
    ...jsonHeaders
  };

  if (correlationId !== undefined) {
    headers[CORRELATION_ID_HEADER] = correlationId;
  }

  return {
    body: JSON.stringify(body),
    headers,
    statusCode
  };
};

export const ok = (data: unknown, correlationId?: string): APIGatewayProxyStructuredResultV2 =>
  jsonResponse(200, createSuccessBody(data, correlationId), correlationId);

export const created = (data: unknown, correlationId?: string): APIGatewayProxyStructuredResultV2 =>
  jsonResponse(201, createSuccessBody(data, correlationId), correlationId);

export const badRequest = (
  message = 'The request is invalid.',
  correlationId?: string
): APIGatewayProxyStructuredResultV2 =>
  jsonResponse(400, createErrorBody(new ValidationError(message), correlationId), correlationId);

export const unauthorized = (
  message = 'Authentication is required.',
  correlationId?: string
): APIGatewayProxyStructuredResultV2 =>
  jsonResponse(401, createErrorBody(new UnauthorizedError(message), correlationId), correlationId);

export const forbidden = (
  message = 'Access is forbidden.',
  correlationId?: string
): APIGatewayProxyStructuredResultV2 =>
  jsonResponse(403, createErrorBody(new ForbiddenError(message), correlationId), correlationId);

export const notFound = (
  message = 'The requested resource was not found.',
  correlationId?: string
): APIGatewayProxyStructuredResultV2 =>
  jsonResponse(404, createErrorBody(new NotFoundError(message), correlationId), correlationId);

export const internalServerError = (
  message = 'An unexpected error occurred.',
  correlationId?: string
): APIGatewayProxyStructuredResultV2 =>
  jsonResponse(
    500,
    createErrorBody(new InternalServerError(message), correlationId),
    correlationId
  );

export const errorResponse = (
  error: ApplicationError,
  correlationId?: string
): APIGatewayProxyStructuredResultV2 =>
  jsonResponse(error.statusCode, createErrorBody(error, correlationId), correlationId);
