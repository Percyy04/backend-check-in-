import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import { ServiceError } from '../utils/errors.js';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {

  /**
   * Upload video to Cloudinary
   */
  async uploadVideo(fileBuffer, options = {}) {
    try {
      const {
        userId,
        folder = process.env.CLOUDINARY_FOLDER || 'gala-brosis-2025',
        resourceType = 'video',
      } = options;

      logger.info('Uploading video to Cloudinary', { userId });

      // Convert buffer to base64
      const base64File = fileBuffer.toString('base64');
      const dataURI = `data:video/mp4;base64,${base64File}`;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: resourceType,
        folder: `${folder}/videos`,
        public_id: userId || `video_${Date.now()}`,
        overwrite: true,
        transformation: [
          { width: 1920, height: 1080, crop: 'limit' },
          { quality: 'auto' },
        ],
      });

      logger.info('Video uploaded successfully', {
        userId,
        url: result.secure_url,
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        duration: result.duration,
        width: result.width,
        height: result.height,
        size: result.bytes,
      };

    } catch (error) {
      logger.error('Cloudinary upload failed', {
        error: error.message,
        userId: options.userId,
      });
      throw new ServiceError('Failed to upload video', 'UPLOAD_FAILED');
    }
  }

  /**
   * Upload image to Cloudinary
   */
  async uploadImage(fileBuffer, options = {}) {
    try {
      const {
        userId,
        folder = process.env.CLOUDINARY_FOLDER || 'gala-brosis-2025',
      } = options;

      logger.info('Uploading image to Cloudinary', { userId });

      const base64File = fileBuffer.toString('base64');
      const dataURI = `data:image/jpeg;base64,${base64File}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        resource_type: 'image',
        folder: `${folder}/images`,
        public_id: userId || `image_${Date.now()}`,
        overwrite: true,
        transformation: [
          { width: 1920, height: 1080, crop: 'limit' },
          { quality: 'auto' },
        ],
      });

      logger.info('Image uploaded successfully', {
        userId,
        url: result.secure_url,
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        size: result.bytes,
      };

    } catch (error) {
      logger.error('Cloudinary upload failed', { error: error.message });
      throw new ServiceError('Failed to upload image', 'UPLOAD_FAILED');
    }
  }

  /**
   * Upload from URL
   */
  async uploadFromUrl(url, options = {}) {
    try {
      const {
        userId,
        folder = process.env.CLOUDINARY_FOLDER || 'gala-brosis-2025',
        resourceType = 'video',
      } = options;

      logger.info('Uploading from URL', { url, userId });

      const result = await cloudinary.uploader.upload(url, {
        resource_type: resourceType,
        folder: `${folder}/${resourceType}s`,
        public_id: userId || `${resourceType}_${Date.now()}`,
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };

    } catch (error) {
      logger.error('URL upload failed', { error: error.message });
      throw new ServiceError('Failed to upload from URL', 'UPLOAD_FAILED');
    }
  }

  /**
   * Delete resource from Cloudinary
   */
  async deleteResource(publicId, resourceType = 'video') {
    try {
      logger.info('Deleting resource', { publicId });

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      logger.info('Resource deleted', { publicId });

      return result;

    } catch (error) {
      logger.error('Delete failed', { error: error.message });
      throw new ServiceError('Failed to delete resource', 'DELETE_FAILED');
    }
  }
}

// Export default instance
const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
