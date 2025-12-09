import express from 'express';
import { ApiResponse } from '../utils/apiResponse.js';

const router = express.Router();

/**
 * GET /
 * #swagger.tags = ['Health']
 * #swagger.summary = 'API information'
 */
router.get('/', function (req, res, next) {
  ApiResponse.success(res, {
    name: 'Gala Brosis 2025 API',
    version: '1.0.0',
    // ... rest
  });
});

export default router;
