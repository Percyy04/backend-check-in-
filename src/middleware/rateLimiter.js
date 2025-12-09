import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * General API Rate Limiter
 * 100 requests per minute mặc định
 */
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 1 minute
  max: config.rateLimit.max, // 100 requests
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.originalUrl,
    });
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    });
  },
});

/**
 * Strict Rate Limiter cho sensitive endpoints (check-in)
 * 30 requests per minute
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    message: 'Too many check-in attempts, please try again later.',
  },
  skipSuccessfulRequests: false, // Count successful requests too
  handler: (req, res) => {
    logger.warn('Strict rate limit exceeded', {
      ip: req.ip,
      path: req.originalUrl,
    });
    res.status(429).json({
      success: false,
      message: 'Too many check-in attempts, please slow down.',
      retryAfter: 60,
    });
  },
});

/**
 * AI Service Rate Limiter
 * 10 requests per minute (vì AI service có thể chậm/đắt)
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'AI service rate limit exceeded, please try QR or manual check-in.',
  },
  handler: (req, res) => {
    logger.warn('AI rate limit exceeded', {
      ip: req.ip,
    });
    res.status(429).json({
      success: false,
      message: 'Too many AI recognition attempts, please try QR or manual check-in.',
      retryAfter: 60,
    });
  },
});
