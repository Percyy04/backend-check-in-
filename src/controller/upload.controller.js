import cloudinaryService from '../services/cloudinary.service.js';
import firestoreService from '../services/firestore.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { BadRequestError } from '../utils/errors.js';
import logger from '../utils/logger.js';

class UploadController {

  async uploadVideo(req, res, next) {
    try {
      const { userId } = req.body;

      if (!userId) {
        throw new BadRequestError('User ID is required');
      }

      if (!req.file) {
        throw new BadRequestError('Video file is required');
      }

      logger.info('Video upload initiated', { userId });

      const user = await firestoreService.getUser(userId);

      if (!user.isVIP) {
        throw new BadRequestError('Only VIPs can upload videos');
      }

      const uploadResult = await cloudinaryService.uploadVideo(req.file.buffer, {
        userId,
      });

      await firestoreService.updateUser(userId, {
        videoUrl: uploadResult.url,
        videoPublicId: uploadResult.publicId,
      });

      return ApiResponse.success(res, {
        userId,
        videoUrl: uploadResult.url,
      }, 'Video uploaded successfully');

    } catch (error) {
      next(error);
    }
  }

  async uploadImage(req, res, next) {
    try {
      const { userId } = req.body;

      if (!userId || !req.file) {
        throw new BadRequestError('User ID and image file are required');
      }

      if (!user.isVIP) {
        throw new BadRequestError('Only VIPs can upload images');
      }

      const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, {
        userId,
      });

      await firestoreService.updateUser(userId, {
        imageUrl: uploadResult.url,
      });

      return ApiResponse.success(res, {
        userId,
        imageUrl: uploadResult.url,
      }, 'Image uploaded successfully');

    } catch (error) {
      next(error);
    }
  }

  async uploadFromUrl(req, res, next) {
    try {
      const { userId, url, type = 'video' } = req.body;

      if (!userId || !url) {
        throw new BadRequestError('User ID and URL are required');
      }

      const uploadResult = await cloudinaryService.uploadFromUrl(url, {
        userId,
        resourceType: type,
      });

      const updateData = type === 'video'
        ? { videoUrl: uploadResult.url, videoPublicId: uploadResult.publicId }
        : { imageUrl: uploadResult.url, imagePublicId: uploadResult.publicId };

      await firestoreService.updateUser(userId, updateData);

      return ApiResponse.success(res, {
        userId,
        url: uploadResult.url,
      }, 'Uploaded from URL successfully');

    } catch (error) {
      next(error);
    }
  }

  async deleteVideo(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await firestoreService.getUser(userId);

      if (!user.videoPublicId) {
        throw new BadRequestError('User has no video to delete');
      }

      await cloudinaryService.deleteResource(user.videoPublicId, 'video');

      await firestoreService.updateUser(userId, {
        videoUrl: null,
        videoPublicId: null,
      });

      return ApiResponse.success(res, null, 'Video deleted successfully');

    } catch (error) {
      next(error);
    }
  }
}

export default new UploadController();
