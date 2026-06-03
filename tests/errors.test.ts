import { describe, expect, it } from '@jest/globals';
import {
  InternalServerError,
  ValidationError,
  isApplicationError,
  normalizeError
} from '../src/errors/index.js';

describe('application errors', () => {
  it('preserves operational application errors', () => {
    const error = new ValidationError('Missing id', { field: 'id' });

    expect(isApplicationError(error)).toBe(true);
    expect(normalizeError(error)).toBe(error);
    expect(error).toMatchObject({
      code: 'VALIDATION_ERROR',
      details: { field: 'id' },
      isOperational: true,
      message: 'Missing id',
      statusCode: 400
    });
  });

  it('normalizes unknown failures as internal server errors', () => {
    const originalError = new Error('database failed');
    const normalizedError = normalizeError(originalError);

    expect(normalizedError).toBeInstanceOf(InternalServerError);
    expect(normalizedError).toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
      statusCode: 500
    });
  });
});
