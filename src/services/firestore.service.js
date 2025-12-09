import { db } from '../config/firebase.js';
import { COLLECTIONS, USER_ROLES, QUEUE_STATUS } from '../config/constants.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import { FieldValue, FieldPath } from 'firebase-admin/firestore';

/**
 * Firestore Service
 * Tất cả operations với Firestore database
 */
class FirestoreService {

  // ==========================================
  // USER OPERATIONS
  // ==========================================

  /**
   * Get user by userId
   */
  async getUser(userId) {
    try {
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();

      if (!userDoc.exists) {
        throw new NotFoundError(`User ${userId} not found`, 'USER_NOT_FOUND');
      }

      return {
        userId: userDoc.id,
        ...userDoc.data(),
      };
    } catch (error) {
      logger.error('Error getting user', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get all VIPs
   */
  /**
 * Get all VIPs (simplified)
 */
  async getAllVIPs() {
    try {
      // Get all users, filter manually
      const snapshot = await db.collection(COLLECTIONS.USERS).get();

      const vips = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.isVIP) {
          vips.push({
            userId: doc.id,
            ...data,
          });
        }
      });

      // Sort manually
      vips.sort((a, b) => a.userId.localeCompare(b.userId));

      logger.info(`Retrieved ${vips.length} VIPs`);
      return vips;
    } catch (error) {
      logger.error('Error getting VIPs', { error: error.message });
      throw error;
    }
  }


  /**
   * Get all users (with pagination)
   */
  async getAllUsers(limit = 50, startAfter = null) {
    try {
      const shouldApplyLimit = limit !== null;
      const normalizedLimit = Number.isFinite(limit) && limit > 0
        ? limit
        : 50;

      let query = db
        .collection(COLLECTIONS.USERS)
        .orderBy(FieldPath.documentId());

      if (shouldApplyLimit) {
        query = query.limit(normalizedLimit);
      }

      if (typeof startAfter === 'string' && startAfter.trim().length > 0) {
        query = query.startAfter(startAfter);
      }

      const snapshot = await query.get();

      console.log('DEBUG: Snapshot size:', snapshot.size); // ← Add debug log

      const users = [];
      snapshot.forEach(doc => {
        users.push({
          userId: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        });
      });

      return users;
    } catch (error) {
      logger.error('Error getting all users', { error: error.message });
      throw error;
    }
  }

  /**
   * Create new user
   */
  async createUser(userData) {
    try {
      const { userId } = userData;

      // Check if user already exists
      const existingUser = await db.collection(COLLECTIONS.USERS).doc(userId).get();
      if (existingUser.exists) {
        throw new ConflictError(`User ${userId} already exists`, 'USER_EXISTS');
      }

      // Create user
      await db.collection(COLLECTIONS.USERS).doc(userId).set({
        ...userData,
        checkedIn: false,
        checkedInAt: null,
        checkedInMethod: null,
        createdAt: new Date(),
      });

      logger.info(`User created: ${userId}`);
      return await this.getUser(userId);
    } catch (error) {
      logger.error('Error creating user', { userId: userData.userId, error: error.message });
      throw error;
    }
  }

  /**
   * Update user check-in status
   */
  async updateCheckinStatus(userId, method) {
    try {
      await db.collection(COLLECTIONS.USERS).doc(userId).update({
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInMethod: method,
      });

      logger.info(`User checked in: ${userId} via ${method}`);
      return await this.getUser(userId);
    } catch (error) {
      logger.error('Error updating check-in status', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Check if user already checked in
   */
  async isUserCheckedIn(userId) {
    try {
      const user = await this.getUser(userId);
      return user.checkedIn === true;
    } catch (error) {
      if (error.code === 'USER_NOT_FOUND') {
        return false;
      }
      throw error;
    }
  }

  // ==========================================
  // QUEUE OPERATIONS
  // ==========================================

  /**
   * Add VIP to check-in queue
   */
  async addToQueue(userId, name, videoUrl) {
    try {
      const queueRef = await db.collection(COLLECTIONS.CHECKIN_QUEUE).add({
        userId,
        name,
        videoUrl,
        status: QUEUE_STATUS.WAITING,
        createdAt: new Date(),
        playedAt: null,
        completedAt: null,
      });

      logger.info(`Added to queue: ${userId}`, { queueId: queueRef.id });

      return {
        queueId: queueRef.id,
        userId,
        name,
        videoUrl,
        status: QUEUE_STATUS.WAITING,
      };
    } catch (error) {
      logger.error('Error adding to queue', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get current queue (WAITING items only)
   */
  async getQueue() {
    try {
      const snapshot = await db.collection(COLLECTIONS.CHECKIN_QUEUE)
        .where('status', '==', QUEUE_STATUS.WAITING)
        .orderBy('createdAt', 'asc')
        .get();

      const queue = [];
      snapshot.forEach(doc => {
        queue.push({
          queueId: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        });
      });

      return queue;
    } catch (error) {
      logger.error('Error getting queue', { error: error.message });
      throw error;
    }
  }

  /**
   * Get queue length
   */
  async getQueueLength() {
    try {
      const snapshot = await db.collection(COLLECTIONS.CHECKIN_QUEUE)
        .where('status', '==', QUEUE_STATUS.WAITING)
        .get();

      return snapshot.size;
    } catch (error) {
      logger.error('Error getting queue length', { error: error.message });
      throw error;
    }
  }

  /**
   * Update queue item status
   */
  async updateQueueStatus(queueId, status) {
    try {
      const updateData = { status };

      if (status === QUEUE_STATUS.PLAYING) {
        updateData.playedAt = new Date();
      } else if (status === QUEUE_STATUS.DONE || status === QUEUE_STATUS.ERROR) {
        updateData.completedAt = new Date();
      }

      await db.collection(COLLECTIONS.CHECKIN_QUEUE).doc(queueId).update(updateData);

      logger.info(`Queue status updated: ${queueId} -> ${status}`);
    } catch (error) {
      logger.error('Error updating queue status', { queueId, status, error: error.message });
      throw error;
    }
  }

  /**
   * Clear all queue items
   */
  async clearQueue() {
    try {
      const snapshot = await db.collection(COLLECTIONS.CHECKIN_QUEUE).get();

      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      logger.info(`Cleared ${snapshot.size} items from queue`);

      return snapshot.size;
    } catch (error) {
      logger.error('Error clearing queue', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete all users
   */
  async deleteAllUsers() {
    try {
      const snapshot = await db.collection(COLLECTIONS.USERS).get();

      // Firestore batch limit is 500 operations
      const batchSize = 500;
      let deletedCount = 0;

      for (let i = 0; i < snapshot.docs.length; i += batchSize) {
        const batch = db.batch();
        const docs = snapshot.docs.slice(i, i + batchSize);

        docs.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        deletedCount += docs.length;
        logger.debug(`Deleted batch: ${docs.length} users (total: ${deletedCount})`);
      }

      logger.info(`Deleted ${deletedCount} users from Firestore`);
      return deletedCount;
    } catch (error) {
      logger.error('Error deleting all users', { error: error.message });
      throw error;
    }
  }

  /**
   * Batch reset all check-ins (using Firestore batch writes)
   * Much more efficient than individual updates - avoids quota exceeded errors
   */
  async batchResetCheckins() {
    try {
      const snapshot = await db.collection(COLLECTIONS.USERS).get();

      // Filter only checked-in users
      const checkedInDocs = snapshot.docs.filter(doc => doc.data().checkedIn === true);

      if (checkedInDocs.length === 0) {
        logger.info('No checked-in users to reset');
        return 0;
      }

      // Firestore batch limit is 500 operations
      const batchSize = 500;
      let resetCount = 0;

      for (let i = 0; i < checkedInDocs.length; i += batchSize) {
        const batch = db.batch();
        const docs = checkedInDocs.slice(i, i + batchSize);

        docs.forEach(doc => {
          batch.update(doc.ref, {
            checkedIn: false,
            checkedInAt: null,
            checkedInMethod: null,
            updatedAt: FieldValue.serverTimestamp(),
          });
        });

        await batch.commit();
        resetCount += docs.length;
        logger.debug(`Reset batch: ${docs.length} users (total: ${resetCount})`);

        // Add small delay between batches to avoid rate limiting
        if (i + batchSize < checkedInDocs.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      logger.info(`Reset ${resetCount} checked-in users`);
      return resetCount;
    } catch (error) {
      logger.error('Error batch resetting check-ins', { error: error.message });
      throw error;
    }
  }

  // ==========================================
  // SYSTEM LOGS
  // ==========================================

  /**
   * Log system event
   */
  async logSystemEvent(level, component, message, metadata = {}) {
    try {
      await db.collection(COLLECTIONS.SYSTEM_LOGS).add({
        timestamp: new Date(),
        level,
        component,
        message,
        metadata,
      });
    } catch (error) {
      logger.error('Error logging system event', { error: error.message });
      // Don't throw error - logging failure shouldn't break app
    }
  }

  /**
   * Get recent system logs
   */
  async getSystemLogs(limit = 50) {
    try {
      const snapshot = await db.collection(COLLECTIONS.SYSTEM_LOGS)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      const logs = [];
      snapshot.forEach(doc => {
        logs.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        });
      });

      return logs;
    } catch (error) {
      logger.error('Error getting system logs', { error: error.message });
      throw error;
    }
  }

  // ==========================================
  // STATISTICS
  // ==========================================

  /**
   * Get check-in statistics
   */
  /**
 * Get check-in statistics (simplified - no composite query)
 */
  async getStats() {
    try {
      // Total users
      const usersSnapshot = await db.collection(COLLECTIONS.USERS).get();
      const totalUsers = usersSnapshot.size;

      // Count manually thay vì dùng where clauses
      let totalCheckedIn = 0;
      let totalVIPs = 0;
      let vipsCheckedIn = 0;

      usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.checkedIn) totalCheckedIn++;
        if (data.isVIP) {
          totalVIPs++;
          if (data.checkedIn) vipsCheckedIn++;
        }
      });

      // Queue length
      const queueLength = await this.getQueueLength();

      return {
        totalUsers,
        totalCheckedIn,
        totalVIPs,
        vipsCheckedIn,
        queueLength,
        checkinRate: totalUsers > 0 ? (totalCheckedIn / totalUsers * 100).toFixed(2) : 0,
      };
    } catch (error) {
      logger.error('Error getting stats', { error: error.message });
      throw error;
    }
  }

  /**
 * Update user data
 */
  async updateUser(userId, updateData) {
    try {
      const userRef = db.collection(COLLECTIONS.USERS).doc(userId);

      const doc = await userRef.get();
      if (!doc.exists) {
        throw new NotFoundError('User not found', 'USER_NOT_FOUND');
      }

      await userRef.update({
        ...updateData,
        updatedAt: FieldValue.serverTimestamp(),
      });

      logger.info('User updated', { userId, fields: Object.keys(updateData) });

      return {
        userId,
        ...updateData,
      };

    } catch (error) {
      logger.error('Error updating user', { userId, error: error.message });
      throw error;
    }
  }

}




// Export singleton instance
export default new FirestoreService();
