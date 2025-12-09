import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Verify JWT Token
 * Dùng cho admin endpoints
 */
export const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.split('Bearer ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'gala-brosis-2025-secret-key-change-in-production';

    // Verify JWT token
    const decodedToken = jwt.verify(token, jwtSecret, {
      issuer: 'gala-brosis-backend',
      audience: 'gala-brosis-api',
    });

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      username: decodedToken.username,
      email: decodedToken.email,
      role: decodedToken.role || 'user',
    };

    logger.debug('User authenticated', { uid: req.user.uid, role: req.user.role });
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid JWT token', {
        error: error.message,
        path: req.originalUrl
      });
      return next(new UnauthorizedError('Invalid token', 'INVALID_TOKEN'));
    }

    if (error.name === 'TokenExpiredError') {
      logger.warn('Expired JWT token', {
        path: req.originalUrl
      });
      return next(new UnauthorizedError('Token expired', 'TOKEN_EXPIRED'));
    }

    logger.warn('Authentication failed', {
      error: error.message,
      path: req.originalUrl
    });

    next(new UnauthorizedError('Invalid or expired token'));
  }
};

/**
 * Check User Role
 * Dùng sau verifyToken
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Access denied - insufficient permissions', {
        user: req.user.uid,
        required: allowedRoles,
        actual: req.user.role,
      });

      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

/**
 * Optional Authentication
 * Token verification nhưng không bắt buộc
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const jwtSecret = process.env.JWT_SECRET || 'gala-brosis-2025-secret-key-change-in-production';

      try {
        const decodedToken = jwt.verify(token, jwtSecret, {
          issuer: 'gala-brosis-backend',
          audience: 'gala-brosis-api',
        });

        req.user = {
          uid: decodedToken.uid,
          username: decodedToken.username,
          email: decodedToken.email,
          role: decodedToken.role || 'user',
        };
      } catch (err) {
        // Ignore token errors in optional auth
        logger.debug('Optional auth token invalid', { error: err.message });
      }
    }

    next();
  } catch (error) {
    // Không throw error, chỉ log
    logger.debug('Optional auth failed, continuing as guest', {
      error: error.message
    });
    next();
  }
};
