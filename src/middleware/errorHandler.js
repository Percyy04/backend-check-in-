import logger from '../utils/logger.js';
import { AppError } from '../utils/errors.js';
import { config } from '../config/env.js';

/**
 * Global Error Handler Middleware
 * Phải đặt cuối cùng trong app.js sau tất cả routes
 */
export const errorHandler = (err, req, res, next) => {
  // Log error
  logger.logError(err, req);

  // Nếu là AppError (operational error) - errors ta tự throw
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.errorCode || err.code,
      ...(err.errors && Array.isArray(err.errors) && err.errors.length > 0 && { errors: err.errors }), // Cho ValidationError
      timestamp: new Date().toISOString(),
    });
  }

  // Programming errors (bugs) - không expose chi tiết
  const statusCode = err.statusCode || 500;
  const message = config.nodeEnv === 'development'
    ? err.message
    : 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && {
      stack: err.stack,
      error: err
    }),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async Error Wrapper
 * Wrap async route handlers để tự động catch errors
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not Found Handler
 * Sử dụng trước errorHandler
 */
export const notFoundHandler = (req, res, next) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
};
