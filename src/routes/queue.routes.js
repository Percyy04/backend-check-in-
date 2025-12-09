import express from 'express';
import queueController from '../controller/queue.controller.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateParams } from '../middleware/validator.js';
import Joi from 'joi';

const router = express.Router();

/**
 * GET /api/queue
 * #swagger.tags = ['Queue']
 * #swagger.summary = 'Get current queue'
 */
router.get(
  '/',
  asyncHandler(queueController.getQueue.bind(queueController))
);

/**
 * GET /api/queue/next
 * #swagger.tags = ['Queue']
 * #swagger.summary = 'Get next item in queue'
 */
router.get(
  '/next',
  asyncHandler(queueController.getNextItem.bind(queueController))
);

/**
 * GET /api/queue/stats
 * #swagger.tags = ['Queue']
 * #swagger.summary = 'Get queue statistics'
 */
router.get(
  '/stats',
  asyncHandler(queueController.getStats.bind(queueController))
);

/**
 * PUT /api/queue/:queueId/playing
 * #swagger.tags = ['Queue']
 * #swagger.summary = 'Mark queue item as playing'
 */
router.put(
  '/:queueId/playing',
  validateParams(Joi.object({
    queueId: Joi.string().required(),
  })),
  asyncHandler(queueController.markAsPlaying.bind(queueController))
);

/**
 * PUT /api/queue/:queueId/done
 * #swagger.tags = ['Queue']
 * #swagger.summary = 'Mark queue item as done'
 */
router.put(
  '/:queueId/done',
  validateParams(Joi.object({
    queueId: Joi.string().required(),
  })),
  asyncHandler(queueController.markAsDone.bind(queueController))
);

/**
 * PUT /api/queue/:queueId/error
 * #swagger.tags = ['Queue']
 * #swagger.summary = 'Mark queue item as error'
 */
router.put(
  '/:queueId/error',
  validateParams(Joi.object({
    queueId: Joi.string().required(),
  })),
  asyncHandler(queueController.markAsError.bind(queueController))
);

export default router; // ✅ MUST HAVE THIS
