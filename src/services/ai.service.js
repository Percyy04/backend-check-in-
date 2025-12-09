import axios from 'axios';
import { config } from '../config/env.js';
import { ServiceUnavailableError, BadRequestError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * AI Service
 * Call AI Recognition API từ đồng đội
 */
class AIService {
  constructor() {
    this.apiUrl = config.ai.serviceUrl;
    this.apiKey = config.ai.apiKey;
    this.timeout = 10000; // 10 seconds timeout
  }

  /**
   * Recognize face from base64 image
   * @param {string} imageBase64 - Base64 encoded image
   * @returns {Promise<Object>} - { userId, name, confidence } - Returns first recognized user
   */
  async recognizeFace(imageBase64) {
    try {
      logger.info('Calling AI recognition service (Python API)...');

      const startTime = Date.now();

      // Call Python AI API
      const response = await axios.post(
        `${this.apiUrl}/recognize`,
        {
          image: imageBase64,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: this.timeout,
        }
      );

      const duration = Date.now() - startTime;

      // Python API returns: { users: [{ userId, name, confidence, house }, ...], detected_faces, recognized_faces }
      const { users, detected_faces, recognized_faces } = response.data;

      // Check if any users were recognized
      if (!users || users.length === 0) {
        logger.info('No faces recognized', {
          detected_faces,
          recognized_faces,
          processingTime: duration,
        });
        throw new BadRequestError('No faces recognized in the image', 'FACE_NOT_FOUND');
      }

      // Get the first (highest confidence) recognized user
      const recognizedUser = users[0];

      logger.info(`AI recognition completed in ${duration}ms`, {
        userId: recognizedUser.userId,
        name: recognizedUser.name,
        confidence: recognizedUser.confidence,
        detected_faces,
        recognized_faces,
      });

      return {
        userId: recognizedUser.userId,
        name: recognizedUser.name,
        confidence: recognizedUser.confidence || 0,
        house: recognizedUser.house || '',
        processingTime: duration,
        detectedFaces: detected_faces,
        recognizedFaces: recognized_faces,
      };

    } catch (error) {
      // Handle different error types
      if (error.code === 'ECONNREFUSED') {
        logger.error('AI service is not available', { error: error.message });
        throw new ServiceUnavailableError(
          'AI recognition service is not available. Please ensure Python API is running on port 8000.',
          'AI_SERVICE_DOWN'
        );
      }

      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        logger.error('AI service timeout', { error: error.message });
        throw new ServiceUnavailableError('AI recognition service timeout', 'AI_SERVICE_TIMEOUT');
      }

      if (error.response) {
        // AI service returned error response
        logger.error('AI service error', {
          status: error.response.status,
          data: error.response.data
        });

        // Handle Python API error responses
        if (error.response.status === 400) {
          const errorMsg = error.response.data.error || error.response.data.message || 'Face recognition failed';
          throw new BadRequestError(errorMsg, 'FACE_NOT_FOUND');
        }

        if (error.response.status === 503) {
          throw new ServiceUnavailableError(
            'AI model or database not loaded. Please check Python API.',
            'AI_SERVICE_NOT_READY'
          );
        }

        throw new ServiceUnavailableError(
          error.response.data.error || error.response.data.message || 'AI recognition failed',
          'AI_SERVICE_ERROR'
        );
      }

      // Re-throw BadRequestError (from face not found)
      if (error instanceof BadRequestError) {
        throw error;
      }

      // Unknown error
      logger.error('Unknown AI service error', { error: error.message });
      throw new ServiceUnavailableError('AI recognition failed', 'AI_SERVICE_ERROR');
    }
  }

  /**
   * Health check AI service
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.apiUrl}/health`, {
        timeout: 5000,
      });

      return {
        available: true,
        status: response.data.status || 'ok',
        modelLoaded: response.data.model_loaded || false,
        databaseSize: response.data.database_size || 0,
      };
    } catch (error) {
      logger.warn('AI service health check failed', { error: error.message });
      return {
        available: false,
        error: error.message,
      };
    }
  }
}

// Export singleton instance
export default new AIService();
