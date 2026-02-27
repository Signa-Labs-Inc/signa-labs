// lib/api-utils.ts

import { AppError } from '@/lib/utils/errors';
import { RateLimitError, ValidationError } from './errors';

export function handleError(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error instanceof ValidationError && error.fields ? { fields: error.fields } : {}),
          ...(error instanceof RateLimitError ? { retryAfter: error.retryAfter } : {}),
        },
      },
      { status: error.statusCode }
    );
  }

  // Unexpected errors
  console.error('Unhandled error:', error);

  return Response.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong',
      },
    },
    { status: 500 }
  );
}
