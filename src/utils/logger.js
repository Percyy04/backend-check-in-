import winston from 'winston';
import { config } from '../config/env.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Tạo logs directory nếu chưa có
const logsDir = join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format cho console
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = '\n' + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${service}] ${level}: ${message}${metaStr}`;
  })
);

// Custom format cho file
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  defaultMeta: { service: 'gala-brosis-api' },
  transports: [
    // Error logs - chỉ log level error
    new winston.transports.File({
      filename: join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined logs - tất cả levels
    new winston.transports.File({
      filename: join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Console output cho development
if (config.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// Helper methods
logger.logRequest = (req, statusCode, duration) => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
};

logger.logError = (error, req = null) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    code: error.code,
  };

  if (req) {
    errorLog.request = {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      ip: req.ip,
    };
  }

  logger.error('Application Error', errorLog);
};

export default logger;
