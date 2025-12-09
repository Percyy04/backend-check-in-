import firestoreService from '../services/firestore.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { validateCreateUser } from '../utils/validators.js';
import { ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Users Controller
 */
class UsersController {

  /**
   * GET /api/users
   * Get all users with pagination
   */
  async getAllUsers(req, res, next) {
    try {
      // Mặc định lấy tất cả users (limit = null), hoặc theo query param
      const { limit, startAfter } = req.query;
      const parsedLimit = limit ? parseInt(limit) : null;

      const users = await firestoreService.getAllUsers(
        parsedLimit,
        startAfter
      );

      return ApiResponse.success(res, {
        users,
        total: users.length,
        limit: parsedLimit,
      }, 'Users retrieved successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/vips
   * Get all VIP users
   */
  async getVIPs(req, res, next) {
    try {
      const vips = await firestoreService.getAllVIPs();

      return ApiResponse.success(res, {
        vips,
        total: vips.length,
      }, 'VIPs retrieved successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:userId
   * Get user by ID
   */
  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await firestoreService.getUser(userId);

      return ApiResponse.success(res, user, 'User found');

    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users
   * Create new user
   */
  async createUser(req, res, next) {
    try {
      // Validate request body
      const { error, value } = validateCreateUser(req.body);

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));
        throw new ValidationError('Validation failed', errors);
      }

      // Create user
      const user = await firestoreService.createUser(value);

      logger.info('User created', { userId: user.userId });

      return ApiResponse.created(res, user, 'User created successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/stats
   * Get user statistics
   */
  async getStats(req, res, next) {
    try {
      const stats = await firestoreService.getStats();

      return ApiResponse.success(res, stats, 'Statistics retrieved');

    } catch (error) {
      next(error);
    }
  }
  /**
 * GET /api/users/list
 * Get simple user list for AI team
 */
  async getUserList(req, res, next) {
    try {
      const users = await firestoreService.getAllUsers();

      const userList = users.map(user => ({
        userId: user.userId,
        name: user.name,
      }));

      return ApiResponse.success(res, {
        users: userList,
        total: userList.length,
      }, 'User list retrieved');

    } catch (error) {
      next(error);
    }
  }

}

export default new UsersController();
