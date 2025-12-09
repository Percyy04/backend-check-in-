import firestoreService from './firestore.service.js';
import { BUSINESS_RULES, QUEUE_STATUS } from '../config/constants.js';
import { ConflictError, BadRequestError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Queue Service
 * Business logic cho queue management
 */
class QueueService {

  /**
   * Add VIP to queue với validation
   */
  async addToQueue(userId, name, videoUrl) {
    try {
      // Check queue length
      const queueLength = await firestoreService.getQueueLength();

      if (queueLength >= BUSINESS_RULES.MAX_QUEUE_LENGTH) {
        logger.warn('Queue is full', { queueLength });
        throw new ConflictError(
          `Queue is full (max ${BUSINESS_RULES.MAX_QUEUE_LENGTH} items)`,
          'QUEUE_FULL'
        );
      }

      // Check if user already in queue
      const currentQueue = await firestoreService.getQueue();
      const alreadyInQueue = currentQueue.some(item => item.userId === userId);

      if (alreadyInQueue) {
        logger.warn('User already in queue', { userId });
        throw new ConflictError(
          'User already in queue',
          'ALREADY_IN_QUEUE'
        );
      }

      // Validate video URL
      if (!videoUrl || !this.isValidVideoUrl(videoUrl)) {
        throw new BadRequestError('Invalid video URL', 'INVALID_VIDEO_URL');
      }

      // Add to queue
      const queueItem = await firestoreService.addToQueue(userId, name, videoUrl);

      logger.info('VIP added to queue', {
        userId,
        queuePosition: queueLength + 1,
      });

      return {
        ...queueItem,
        position: queueLength + 1,
      };

    } catch (error) {
      logger.error('Error adding to queue', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get queue with position numbers
   */
  async getQueueWithPositions() {
    try {
      const queue = await firestoreService.getQueue();

      return queue.map((item, index) => ({
        ...item,
        position: index + 1,
        estimatedWaitTime: (index + 1) * 30, // 30 seconds per video
      }));
    } catch (error) {
      logger.error('Error getting queue', { error: error.message });
      throw error;
    }
  }

  /**
   * Get next item in queue
   */
  async getNextItem() {
    try {
      const queue = await firestoreService.getQueue();

      if (queue.length === 0) {
        return null;
      }

      return queue[0];
    } catch (error) {
      logger.error('Error getting next item', { error: error.message });
      throw error;
    }
  }

  /**
   * Mark queue item as playing
   */
  async markAsPlaying(queueId) {
    try {
      await firestoreService.updateQueueStatus(queueId, QUEUE_STATUS.PLAYING);
      logger.info('Queue item marked as playing', { queueId });
    } catch (error) {
      logger.error('Error marking as playing', { queueId, error: error.message });
      throw error;
    }
  }

  /**
   * Mark queue item as done
   */
  async markAsDone(queueId) {
    try {
      await firestoreService.updateQueueStatus(queueId, QUEUE_STATUS.DONE);
      logger.info('Queue item marked as done', { queueId });
    } catch (error) {
      logger.error('Error marking as done', { queueId, error: error.message });
      throw error;
    }
  }

  /**
   * Mark queue item as error
   */
  async markAsError(queueId) {
    try {
      await firestoreService.updateQueueStatus(queueId, QUEUE_STATUS.ERROR);
      logger.info('Queue item marked as error', { queueId });
    } catch (error) {
      logger.error('Error marking as error', { queueId, error: error.message });
      throw error;
    }
  }

  /**
   * Clear entire queue
   */
  async clearQueue() {
    try {
      const count = await firestoreService.clearQueue();
      logger.info(`Queue cleared: ${count} items removed`);
      return count;
    } catch (error) {
      logger.error('Error clearing queue', { error: error.message });
      throw error;
    }
  }

  /**
   * Validate video/image URL
   * Chấp nhận cả video URL và image URL (vì imageUrl có thể là video)
   */
  isValidVideoUrl(url) {
    try {
      const urlObj = new URL(url);
      // Check if URL is valid (https) và có thể là video/image từ CDN hoặc local
      // Chấp nhận: Cloudinary, CDN, hoặc bất kỳ https URL nào
      return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
    } catch {
      return false;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    try {
      const queue = await firestoreService.getQueue();
      const queueLength = queue.length;
      const totalWaitTime = queueLength * 30; // seconds

      return {
        queueLength,
        totalWaitTime,
        averageWaitTime: queueLength > 0 ? totalWaitTime / queueLength : 0,
        oldestItemTime: queue[0]?.createdAt || null,
      };
    } catch (error) {
      logger.error('Error getting queue stats', { error: error.message });
      throw error;
    }
  }
}

// Export singleton instance
export default new QueueService();
