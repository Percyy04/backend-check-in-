import express from 'express';
import checkinController from '../controller/checkin.controller.js'; // ← Fixed: thêm 's'
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateBody, validateQuery } from '../middleware/validator.js'; // ← Import validateQuery
import { aiLimiter, strictLimiter } from '../middleware/rateLimiter.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import Joi from 'joi';

const router = express.Router();

/**
 * POST /api/checkin/ai
 * Check-in using AI face recognition
 */
router.post(
  '/ai',
  aiLimiter,
  validateBody(Joi.object({
    // Option 1: Image-based (base64 string)
    imageBase64: Joi.string().min(100).optional(),
    // Option 2: Pre-detected userId (F00, P00, T00, U00 hoặc VIP_XXX, GUEST_XXX)
    userId: Joi.string()
      .pattern(/^([FPUT]\d{2}|VIP_\d{3}|GUEST_\d{3}|STAFF_\d{3})$/i)
      .optional(),

    confidence: Joi.number().min(0).max(1).optional(),
  })
    .or('imageBase64', 'userId') // ← Must have at least one
    .messages({
      'object.missing': 'Either imageBase64 or userId is required',
      'string.pattern.base': 'Invalid userId format (e.g., F00, P00, VIP_001)',
    })),
  asyncHandler(checkinController.checkinWithAI.bind(checkinController))
);

/**
 * POST /api/checkin/qr
 * Check-in using QR code
 */
router.post(
  '/qr',
  strictLimiter,
  validateBody(Joi.object({
    userId: Joi.string()
      .pattern(/^([FPUT]\d{2}|VIP_\d{3}|GUEST_\d{3}|STAFF_\d{3})$/i)
      .required()
      .messages({
        'string.pattern.base': 'Invalid userId format (e.g., F00, P00, VIP_001)',
      }),
  })),
  asyncHandler(checkinController.checkinWithQR.bind(checkinController))
);

/**
 * POST /api/checkin/manual
 * Manual check-in by staff (requires admin authentication)
 */
router.post(
  '/manual',
  strictLimiter,
  verifyToken,
  requireRole('admin'),
  validateBody(Joi.object({
    userId: Joi.string().required(),
  })),
  asyncHandler(checkinController.checkinManual.bind(checkinController))
);

/**
 * GET /api/checkin/history
 * Get check-in history
 */
router.get(
  '/history',
  validateQuery(Joi.object({ // ← Fixed: validateQuery thay vì validateBody
    limit: Joi.number().integer().min(1).max(100).default(50).optional(),
  })),
  asyncHandler(checkinController.getHistory.bind(checkinController))
);

export default router;
