import queueService from '../services/queue.service.js';
import firestoreService from '../services/firestore.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

/**
 * Queue Controller
 */
class QueueController {

  /**
   * GET /api/queue
   * Get current queue
   */
  async getQueue(req, res, next) {
    try {
      const queue = await queueService.getQueueWithPositions();

      return ApiResponse.success(res, {
        queue,
        length: queue.length,
      }, 'Queue retrieved successfully');

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/queue/next
   * Get next item in queue
   */
  async getNextItem(req, res, next) {
    try {
      const nextItem = await queueService.getNextItem();

      if (!nextItem) {
        return ApiResponse.success(res, null, 'Queue is empty');
      }

      return ApiResponse.success(res, nextItem, 'Next item retrieved');

    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/queue/:queueId/playing
   * Mark queue item as playing
   */
  async markAsPlaying(req, res, next) {
    try {
      const { queueId } = req.params;

      await queueService.markAsPlaying(queueId);

      return ApiResponse.success(res, null, 'Marked as playing');

    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/queue/:queueId/done
   * Mark queue item as done
   */
  async markAsDone(req, res, next) {
    try {
      const { queueId } = req.params;

      await queueService.markAsDone(queueId);

      return ApiResponse.success(res, null, 'Marked as done');

    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/queue/:queueId/error
   * Mark queue item as error
   */
  async markAsError(req, res, next) {
    try {
      const { queueId } = req.params;

      await queueService.markAsError(queueId);

      return ApiResponse.success(res, null, 'Marked as error');

    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/queue/stats
   * Get queue statistics
   */
  async getStats(req, res, next) {
    try {
      const stats = await queueService.getQueueStats();

      return ApiResponse.success(res, stats, 'Queue statistics retrieved');

    } catch (error) {
      next(error);
    }
  }
}

export default new QueueController();
