import express from 'express';
import uploadController from '../controller/upload.controller.js';
import { uploadVideo, uploadImage } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * POST /api/upload/video
 * #swagger.tags = ['Upload']
 * #swagger.summary = 'Upload VIP video'
 */
router.post(
  '/video',
  uploadVideo,
  asyncHandler(uploadController.uploadVideo.bind(uploadController))
);

/**
 * POST /api/upload/image
 * #swagger.tags = ['Upload']
 * #swagger.summary = 'Upload user image'
 */
router.post(
  '/image',
  uploadImage,
  asyncHandler(uploadController.uploadImage.bind(uploadController))
);

/**
 * POST /api/upload/url
 * #swagger.tags = ['Upload']
 * #swagger.summary = 'Upload from URL'
 */
router.post(
  '/url',
  asyncHandler(uploadController.uploadFromUrl.bind(uploadController))
);

/**
 * DELETE /api/upload/video/:userId
 * #swagger.tags = ['Upload']
 * #swagger.summary = 'Delete video'
 */
router.delete(
  '/video/:userId',
  asyncHandler(uploadController.deleteVideo.bind(uploadController))
);

export default router;
