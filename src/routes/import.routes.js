import express from 'express';
import importController from '../controller/import.controller.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validateBody } from '../middleware/validator.js';
import Joi from 'joi';

const router = express.Router();

// All import routes require admin authentication
router.use(verifyToken, requireRole('admin'));

/**
 * POST /api/import/csv
 * #swagger.tags = ['Import']
 * #swagger.summary = 'Import users from CSV file'
 * #swagger.description = 'Import users from CSV. Format: Name, House, ID_Name, ID_Image, Seat (optional for VIP)'
 */
router.post(
  '/csv',
  upload.single('file'),
  asyncHandler(importController.importFromCSV.bind(importController))
);

/**
 * POST /api/import/json
 * #swagger.tags = ['Import']
 * #swagger.summary = 'Import users from JSON (AI team format)'
 * #swagger.description = 'Import users from JSON. Format: [{ Name, ID_Name }]'
 */
router.post(
  '/json',
  validateBody(Joi.object({
    users: Joi.array().items(
      Joi.object({
        Name: Joi.string().required(),
        ID_Name: Joi.string().required(),
      })
    ).min(1).required(),
  })),
  asyncHandler(importController.importFromJSON.bind(importController))
);

export default router;


