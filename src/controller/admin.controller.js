import queueService from '../services/queue.service.js';
import firestoreService from '../services/firestore.service.js';
import aiService from '../services/ai.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

/**
 * Admin Controller
 */
class AdminController {

  /**
   * DELETE /api/admin/queue
   * Clear entire queue
   */
  async clearQueue(req, res, next) {
    try {
      const count = await queueService.clearQueue();

      logger.warn('Queue cleared by admin', { count, ip: req.ip });

      return ApiResponse.success(res, {
        itemsCleared: count,
      }, 'Queue cleared successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/stats
   * Get comprehensive system statistics
   */
  async getSystemStats(req, res, next) {
    try {
      const [userStats, queueStats, systemLogs] = await Promise.all([
        firestoreService.getStats(),
        queueService.getQueueStats(),
        firestoreService.getSystemLogs(10),
      ]);

      return ApiResponse.success(res, {
        users: userStats,
        queue: queueStats,
        recentLogs: systemLogs,
        timestamp: new Date(),
      }, 'System statistics retrieved');

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/logs
   * Get system logs
   */
  async getLogs(req, res, next) {
    try {
      const { limit = 50 } = req.query;

      const logs = await firestoreService.getSystemLogs(parseInt(limit));

      return ApiResponse.success(res, {
        logs,
        total: logs.length,
      }, 'System logs retrieved');

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/health
   * Comprehensive health check
   */
  async healthCheck(req, res, next) {
    try {
      const health = {
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        services: {
          firestore: 'ok',
          ai: 'checking',
        },
      };

      // Check AI service
      try {
        const aiHealth = await aiService.healthCheck();
        health.services.ai = aiHealth.available ? 'ok' : 'unavailable';
      } catch {
        health.services.ai = 'unavailable';
      }

      return ApiResponse.success(res, health, 'Health check completed');

    } catch (error) {
      next(error);
    }
  }

  /**
 * POST /api/admin/reset-checkins
 * Reset all check-ins (uses batch writes to avoid quota exceeded errors)
 */
  async resetAllCheckins(req, res, next) {
    try {
      logger.warn('⚠️ Reset all check-ins initiated');

      // Clear queue first
      await queueService.clearQueue();

      // Use batch reset instead of individual updates
      const resetCount = await firestoreService.batchResetCheckins();

      // Get total user count for response
      const users = await firestoreService.getAllUsers(null);

      logger.info('✅ All check-ins reset', { resetCount });

      return ApiResponse.success(res, {
        resetCount,
        totalUsers: users.length,
        message: `Reset ${resetCount} checked-in users`,
      }, 'Check-ins reset successfully');

    } catch (error) {
      logger.error('Failed to reset check-ins', { error: error.message });
      next(error);
    }
  }

  /**
   * POST /api/admin/reset-data
   * Reset all data: delete all users and clear queue
   */
  async resetData(req, res, next) {
    try {
      logger.warn('⚠️ Reset all data initiated - deleting all users');

      // Clear queue first
      const queueCount = await queueService.clearQueue();
      logger.info(`Cleared ${queueCount} items from queue`);

      // Delete all users
      const deletedCount = await firestoreService.deleteAllUsers();
      logger.info(`Deleted ${deletedCount} users`);

      logger.info('✅ All data reset', {
        queueCleared: queueCount,
        usersDeleted: deletedCount,
      });

      return ApiResponse.success(res, {
        queueCleared: queueCount,
        usersDeleted: deletedCount,
        message: `Deleted ${deletedCount} users and cleared ${queueCount} queue items`,
      }, 'All data reset successfully');

    } catch (error) {
      logger.error('Failed to reset data', { error: error.message });
      next(error);
    }
  }
}

export default new AdminController();
