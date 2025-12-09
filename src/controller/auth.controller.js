import jwt from 'jsonwebtoken';
import { ApiResponse } from '../utils/apiResponse.js';
import { BadRequestError, UnauthorizedError } from '../utils/errors.js';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';
import bcrypt from 'bcryptjs';

/**
 * Auth Controller
 * Xử lý đăng nhập cho admin
 */
class AuthController {
  /**
   * POST /api/auth/login
   * Admin login với username/password
   */
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        throw new BadRequestError('Username and password are required', 'MISSING_CREDENTIALS');
      }

      // Get admin credentials from env hoặc Firestore
      const adminUsername = process.env.ADMIN_USERNAME || 'admin';
      const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

      // Nếu không có hash trong env, dùng plain password (chỉ cho dev)
      let isValid = false;
      if (adminPasswordHash) {
        isValid = await bcrypt.compare(password, adminPasswordHash);
      } else {
        // Dev mode: plain password comparison
        const plainPassword = process.env.ADMIN_PASSWORD || 'admin123';
        isValid = username === adminUsername && password === plainPassword;
        if (config.nodeEnv === 'production') {
          logger.warn('⚠️ Using plain password in production! Set ADMIN_PASSWORD_HASH');
        }
      }

      if (!isValid || username !== adminUsername) {
        logger.warn('Failed login attempt', { username, ip: req.ip });
        throw new UnauthorizedError('Invalid username or password', 'INVALID_CREDENTIALS');
      }

      // Tạo JWT token cho admin
      const jwtSecret = process.env.JWT_SECRET || 'gala-brosis-2025-secret-key-change-in-production';
      const adminUid = `admin_${username}`;

      const token = jwt.sign(
        {
          uid: adminUid,
          username,
          role: 'admin',
          email: `${username}@gala-brosis.local`,
        },
        jwtSecret,
        {
          expiresIn: '1h',
          issuer: 'gala-brosis-backend',
          audience: 'gala-brosis-api',
        }
      );

      logger.info('Admin logged in successfully', { username, ip: req.ip });

      return ApiResponse.success(res, {
        token,
        user: {
          username,
          role: 'admin',
        },
        expiresIn: 3600, // 1 hour
      }, 'Login successful');

    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/verify
   * Verify token và trả về thông tin user
   * (Middleware verifyToken đã verify rồi, chỉ cần trả về user info)
   */
  async verify(req, res, next) {
    try {
      // req.user đã được set bởi verifyToken middleware
      return ApiResponse.success(res, {
        user: req.user,
        valid: true,
      }, 'Token is valid');

    } catch (error) {
      next(new UnauthorizedError('Invalid or expired token', 'INVALID_TOKEN'));
    }
  }
}

export default new AuthController();

