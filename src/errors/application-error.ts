import type { JsonValue } from '../types/api.js';

export interface ApplicationErrorOptions {
  code: string;
  details?: JsonValue;
  message: string;
  statusCode: number;
  cause?: unknown;
}

export class ApplicationError extends Error {
  public readonly code: string;

  public readonly details?: JsonValue;

  public readonly isOperational = true;

  public readonly statusCode: number;

  public constructor(options: ApplicationErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = new.target.name;
    this.code = options.code;
    this.statusCode = options.statusCode;

    if (options.details !== undefined) {
      this.details = options.details;
    }
  }
}

export class ValidationError extends ApplicationError {
  public constructor(message = 'The request is invalid.', details?: JsonValue) {
    const options: ApplicationErrorOptions = {
      code: 'VALIDATION_ERROR',
      message,
      statusCode: 400
    };

    if (details !== undefined) {
      options.details = details;
    }

    super(options);
  }
}

export class UnauthorizedError extends ApplicationError {
  public constructor(message = 'Authentication is required.') {
    super({
      code: 'UNAUTHORIZED',
      message,
      statusCode: 401
    });
  }
}

export class ForbiddenError extends ApplicationError {
  public constructor(message = 'Access is forbidden.') {
    super({
      code: 'FORBIDDEN',
      message,
      statusCode: 403
    });
  }
}

export class NotFoundError extends ApplicationError {
  public constructor(message = 'The requested resource was not found.') {
    super({
      code: 'NOT_FOUND',
      message,
      statusCode: 404
    });
  }
}

export class InternalServerError extends ApplicationError {
  public constructor(message = 'An unexpected error occurred.', cause?: unknown) {
    const options: ApplicationErrorOptions = {
      code: 'INTERNAL_SERVER_ERROR',
      message,
      statusCode: 500
    };

    if (cause !== undefined) {
      options.cause = cause;
    }

    super(options);
  }
}

export const isApplicationError = (error: unknown): error is ApplicationError =>
  error instanceof ApplicationError;

export const normalizeError = (error: unknown): ApplicationError => {
  if (isApplicationError(error)) {
    return error;
  }

  return new InternalServerError('An unexpected error occurred.', error);
};
