import express from 'express';
import adminController from '../controller/admin.controller.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateQuery } from '../middleware/validator.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import Joi from 'joi';


const router = express.Router();

// require admin token
router.use(verifyToken, requireRole('admin'));

/**
 * GET /api/admin/health
 * #swagger.tags = ['Admin']
 * #swagger.summary = 'System health check'
 */
router.get(
  '/health',
  asyncHandler(adminController.healthCheck.bind(adminController))
);

/**
 * GET /api/admin/stats
 * #swagger.tags = ['Admin']
 * #swagger.summary = 'Get system statistics'
 */
router.get(
  '/stats',
  asyncHandler(adminController.getSystemStats.bind(adminController))
);

/**
 * GET /api/admin/logs
 * #swagger.tags = ['Admin']
 * #swagger.summary = 'Get system logs'
 */
router.get(
  '/logs',
  validateQuery(Joi.object({
    limit: Joi.number().integer().min(1).max(200).default(50),
  })),
  asyncHandler(adminController.getLogs.bind(adminController))
);

/**
 * DELETE /api/admin/queue
 * #swagger.tags = ['Admin']
 * #swagger.summary = 'Clear entire queue'
 */
router.delete(

  '/queue',
  asyncHandler(adminController.clearQueue.bind(adminController))
);

/**
 * POST /api/admin/reset
 * #swagger.tags = ['Admin']
 * #swagger.summary = 'Reset all check-ins'
 */
router.post(
  '/reset',
  asyncHandler(adminController.resetAllCheckins.bind(adminController))
);

/**
 * POST /api/admin/reset-data
 * #swagger.tags = ['Admin']
 * #swagger.summary = 'Reset all data'
 */
router.post(
  '/reset-data',
  asyncHandler(adminController.resetData.bind(adminController.resetData))
);


export default router; 
