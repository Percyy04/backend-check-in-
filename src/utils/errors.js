import logger from './logger.js';

/**
 * Base API Error
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Bad request', errorCode = 'BAD_REQUEST') {
    super(message, 400, errorCode);
  }
}

/**
 * 401 Unauthorized
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
    super(message, 401, errorCode);
  }
}

/**
 * 403 Forbidden
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', errorCode = 'FORBIDDEN') {
    super(message, 403, errorCode);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    super(message, 404, errorCode);
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends ApiError {
  constructor(message = 'Conflict', errorCode = 'CONFLICT') {
    super(message, 409, errorCode);
  }
}

/**
 * 422 Unprocessable Entity
 */
export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', errorCode = 'VALIDATION_ERROR', errors = []) {
    super(message, 422, errorCode);
    this.errors = errors;
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error', errorCode = 'INTERNAL_ERROR') {
    super(message, 500, errorCode);
  }
}

/**
 * 503 Service Error (for external service failures)
 */
export class ServiceError extends ApiError {
  constructor(message = 'Service unavailable', errorCode = 'SERVICE_ERROR') {
    super(message, 503, errorCode);
  }
}
export class AppError extends ApiError {
  constructor(message = 'Application error', errorCode = 'APP_ERROR') {
    super(message, 500, errorCode);
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service unavailable', errorCode = 'SERVICE_UNAVAILABLE') {
    super(message, 503, errorCode);
  }
}

/**
 * 429 Too Many Requests
 */
export class RateLimitError extends ApiError {
  constructor(message = 'Too many requests', errorCode = 'RATE_LIMIT') {
    super(message, 429, errorCode);
  }
}

/**
 * Error handler
 */
export function handleError(error, req, res, next) {
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errorCode: error.errorCode,
      errors: error.errors || undefined,
    });
  }

  // Unexpected errors
  logger.error('Unexpected error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
  });

  return res.status(500).json({
    success: false,
    message: 'Something went wrong',
    errorCode: 'INTERNAL_ERROR',
  });
}
