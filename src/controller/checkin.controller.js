import firestoreService from '../services/firestore.service.js';
import aiService from '../services/ai.service.js';
import queueService from '../services/queue.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { CHECKIN_METHODS, BUSINESS_RULES } from '../config/constants.js';
import {
  BadRequestError,
  NotFoundError,
  ConflictError
} from '../utils/errors.js';
import logger from '../utils/logger.js';

const getCheckinDate = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === 'function') {
    const date = value.toDate();
    return date instanceof Date ? date : null;
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value);
  }

  return null;
};

class CheckinController {

  async checkinWithAI(req, res, next) {
    try {
      const { imageBase64, userId, confidence } = req.body;

      let detectedUserId = userId;
      let detectedConfidence = confidence || 0.95;
      let aiResult = null; // Store AI recognition result

      // ============================================
      // Case 1: AI already detected → userId provided
      // ============================================
      if (userId) {
        logger.info('AI check-in with pre-detected userId', {
          userId,
          confidence: detectedConfidence
        });

        // Proceed with check-in directly
      }

      // ============================================
      // Case 2: Image provided → need AI detection
      // ============================================
      else if (imageBase64) {
        logger.info('AI check-in with image - calling Python API', {
          imageLength: imageBase64.length
        });

        // Call Python AI service to recognize face
        aiResult = await aiService.recognizeFace(imageBase64);

        detectedUserId = aiResult.userId;
        detectedConfidence = aiResult.confidence;

        logger.info('AI recognition result', {
          userId: detectedUserId,
          name: aiResult.name,
          confidence: detectedConfidence,
          processingTime: aiResult.processingTime,
        });
      }

      // ============================================
      // Case 3: Neither provided
      // ============================================
      else {
        throw new BadRequestError(
          'Either userId or imageBase64 is required',
          'MISSING_PARAMETERS'
        );
      }

      // ============================================
      // Check-in user
      // ============================================

      // Get user
      const user = await firestoreService.getUser(detectedUserId);

      if (!user) {
        throw new NotFoundError('User not found', 'USER_NOT_FOUND');
      }

      // Check if already checked in
      if (user.checkedIn) {
        throw new ConflictError(
          'User already checked in',
          'ALREADY_CHECKED_IN'
        );
      }

      // Update check-in status
      await firestoreService.updateUser(detectedUserId, {
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInMethod: 'AI',
      });

      // Get updated user
      const updatedUser = await firestoreService.getUser(detectedUserId);

      const result = {
        user: updatedUser,
        checkinMethod: 'AI',
        confidence: detectedConfidence,
        timestamp: new Date().toISOString(),
        // Include AI recognition details if image was provided
        ...(aiResult && {
          aiRecognition: {
            confidence: detectedConfidence,
            processingTime: aiResult.processingTime,
            detectedFaces: aiResult.detectedFaces,
            recognizedFaces: aiResult.recognizedFaces,
          }
        }),
      };

      // ============================================
      // Add to queue if VIP (sử dụng videoUrl)
      // ============================================
      if (updatedUser.isVIP && updatedUser.videoUrl) {
        try {
          const queueItem = await queueService.addToQueue(
            updatedUser.userId,
            updatedUser.name,
            updatedUser.videoUrl
          );
          result.queue = queueItem;
        } catch (error) {
          logger.error('Failed to add to queue', { error: error.message });
          // Continue even if queue fails
        }
      }

      logger.info('AI check-in successful', {
        userId: detectedUserId,
        confidence: detectedConfidence
      });

      return ApiResponse.success(res, result, 'Check-in successful via AI');

    } catch (error) {
      next(error);
    }
  }

  async checkinWithQR(req, res, next) {
    try {
      const { userId } = req.body;

      if (!userId) {
        throw new BadRequestError('User ID is required', 'USERID_REQUIRED');
      }

      logger.info('QR check-in initiated', { userId, ip: req.ip });

      const user = await firestoreService.getUser(userId);

      const lastCheckinDate = getCheckinDate(user.checkedInAt);

      if (user.checkedIn && lastCheckinDate) {
        const checkedInMinutesAgo = Math.floor(
          (Date.now() - lastCheckinDate.getTime()) / 1000 / 60
        );

        if (checkedInMinutesAgo < BUSINESS_RULES.CHECKIN_COOLDOWN_MINUTES) {
          throw new ConflictError(
            `Already checked in ${checkedInMinutesAgo} minutes ago`,
            'ALREADY_CHECKED_IN'
          );
        }
      } else if (user.checkedIn) {
        throw new ConflictError('User already checked in', 'ALREADY_CHECKED_IN');
      }

      await firestoreService.updateCheckinStatus(userId, CHECKIN_METHODS.QR);

      let queueInfo = null;
      if (user.isVIP && user.videoUrl) {
        try {
          queueInfo = await queueService.addToQueue(
            userId,
            user.name,
            user.videoUrl
          );
        } catch (error) {
          logger.error('Failed to add VIP to queue', { userId, error: error.message });
        }
      }

      return ApiResponse.success(res, {
        user: {
          userId: user.userId,
          name: user.name,
          seat: user.seat,
          isVIP: user.isVIP,
        },
        checkinMethod: CHECKIN_METHODS.QR,
        ...(queueInfo && { queue: queueInfo }),
      }, 'Check-in successful', 200);

    } catch (error) {
      next(error);
    }
  }

  async checkinManual(req, res, next) {
    try {
      const { userId } = req.body;

      if (!userId) {
        throw new BadRequestError('User ID is required', 'USERID_REQUIRED');
      }

      logger.info('Manual check-in initiated', { userId, ip: req.ip });

      const user = await firestoreService.getUser(userId);

      const lastCheckinDate = getCheckinDate(user.checkedInAt);

      if (user.checkedIn && lastCheckinDate) {
        const checkedInMinutesAgo = Math.floor(
          (Date.now() - lastCheckinDate.getTime()) / 1000 / 60
        );

        if (checkedInMinutesAgo < BUSINESS_RULES.CHECKIN_COOLDOWN_MINUTES) {
          throw new ConflictError(
            `Already checked in ${checkedInMinutesAgo} minutes ago`,
            'ALREADY_CHECKED_IN'
          );
        }
      } else if (user.checkedIn) {
        throw new ConflictError('User already checked in', 'ALREADY_CHECKED_IN');
      }

      await firestoreService.updateCheckinStatus(userId, CHECKIN_METHODS.MANUAL);

      let queueInfo = null;
      if (user.isVIP && user.videoUrl) {
        try {
          queueInfo = await queueService.addToQueue(
            userId,
            user.name,
            user.videoUrl
          );
        } catch (error) {
          logger.error('Failed to add VIP to queue', { userId, error: error.message });
        }
      }

      return ApiResponse.success(res, {
        user: {
          userId: user.userId,
          name: user.name,
          seat: user.seat,
          isVIP: user.isVIP,
        },
        checkinMethod: CHECKIN_METHODS.MANUAL,
        ...(queueInfo && { queue: queueInfo }),
      }, 'Check-in successful', 200);

    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const { limit = 50 } = req.query;

      // Lấy tất cả users rồi filter những người đã check-in
      const users = await firestoreService.getAllUsers(null);

      const history = users
        .filter(user => user.checkedIn)
        .sort((a, b) => {
          const timeA = a.checkedInAt?.toDate?.() || 0;
          const timeB = b.checkedInAt?.toDate?.() || 0;
          return timeB - timeA;
        })
        .slice(0, parseInt(limit)) // Limit sau khi sort
        .map(user => ({
          userId: user.userId,
          name: user.name,
          seat: user.seat,
          isVIP: user.isVIP,
          method: user.checkedInMethod,
          checkedInAt: user.checkedInAt?.toDate?.(),
        }));

      return ApiResponse.success(res, {
        history,
        total: history.length,
      }, 'Check-in history retrieved', 200);

    } catch (error) {
      next(error);
    }
  }
}

export default new CheckinController();
