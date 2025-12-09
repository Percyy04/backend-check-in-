import logger from '../utils/logger.js';

/**
 * Request Logger Middleware
 * Log mọi HTTP requests với duration
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    logger.logRequest(req, res.statusCode, duration);
  });

  next();
};

/**
 * Request ID Middleware
 * Thêm unique request ID vào mỗi request
 */
export const requestId = (req, res, next) => {
  const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
};

/**
 * Body Logger Middleware (cho debugging)
 * Chỉ dùng trong development
 */
export const bodyLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    if (req.body && Object.keys(req.body).length > 0) {
      logger.debug('Request Body:', req.body);
    }
  }
  next();
};
