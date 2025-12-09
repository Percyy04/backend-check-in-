import express from 'express';
import authController from '../controller/auth.controller.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateBody } from '../middleware/validator.js';
import { verifyToken } from '../middleware/auth.js';
import { strictLimiter } from '../middleware/rateLimiter.js';
import Joi from 'joi';

const router = express.Router();

/**
 * POST /api/auth/login
 * #swagger.tags = ['Auth']
 * #swagger.summary = 'Admin login'
 */
router.post(
  '/login',
  strictLimiter,
  validateBody(Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  })),
  asyncHandler(authController.login.bind(authController))
);

/**
 * POST /api/auth/verify
 * #swagger.tags = ['Auth']
 * #swagger.summary = 'Verify authentication token'
 */
router.post(
  '/verify',
  verifyToken,
  asyncHandler(authController.verify.bind(authController))
);

export default router;

