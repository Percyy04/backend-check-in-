import express from 'express';
import usersController from '../controller/users.controller.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateQuery, validateParams } from '../middleware/validator.js';
import Joi from 'joi';

const router = express.Router();

// Specific routes MUST come before dynamic routes
router.get('/list', asyncHandler(usersController.getUserList.bind(usersController)));
router.get('/stats', asyncHandler(usersController.getStats.bind(usersController)));
router.get('/vips', asyncHandler(usersController.getVIPs.bind(usersController)));

router.get('/', validateQuery(Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional(),
  startAfter: Joi.string().optional(),
})), asyncHandler(usersController.getAllUsers.bind(usersController)));

router.post('/', asyncHandler(usersController.createUser.bind(usersController)));

// Dynamic route MUST be last
router.get('/:userId', validateParams(Joi.object({
  userId: Joi.string().pattern(/^([FPUT]\d{2}|VIP_\d{3}|GUEST_\d{3}|STAFF_\d{3})$/i).required(),
})), asyncHandler(usersController.getUserById.bind(usersController)));

export default router;
