import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import expressOasGenerator from 'express-oas-generator';

// Import logger
import logger from './src/utils/logger.js';

// Import middleware
import {
  errorHandler,
  notFoundHandler
} from './src/middleware/errorHandler.js';
import {
  requestLogger,
  requestId,
  bodyLogger
} from './src/middleware/logger.js';
import { generalLimiter } from './src/middleware/rateLimiter.js';

// Import routes
import indexRouter from './src/routes/index.js';
import usersRouter from './src/routes/users.js';
import checkinRouter from './src/routes/checkin.routes.js';
import queueRouter from './src/routes/queue.routes.js';
import adminRouter from './src/routes/admin.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============================================
// SWAGGER AUTO-GENERATOR (INIT TRƯỚC KHI MOUNT ROUTES)
// ============================================
if (process.env.NODE_ENV !== 'production') {
  expressOasGenerator.init(app, {
    predefinedSpec: {
      info: {
        title: 'Gala Brosis 2025 API',
        version: '1.0.0',
        description: 'Smart Check-in System with AI Face Recognition',
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
      ],
      tags: [
        { name: 'Health', description: 'Health check' },
        { name: 'Check-in', description: 'Check-in operations' },
        { name: 'Users', description: 'User management' },
        { name: 'Queue', description: 'Queue management' },
        { name: 'Admin', description: 'Admin operations' },
      ],
    },
  });
  logger.info('📚 Swagger auto-documentation enabled at /api-docs');
}

// ============================================
// 1. SECURITY & PERFORMANCE MIDDLEWARE
// ============================================
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://gala-brosis-2025.web.app']
    : '*',
  credentials: true,
}));
app.use(compression());

// ============================================
// 2. PARSING MIDDLEWARE
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ============================================
// 3. LOGGING MIDDLEWARE
// ============================================
app.use(requestId);
app.use(requestLogger);
app.use(bodyLogger);

// ============================================
// 4. HEALTH CHECK (before rate limit)
// ============================================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// ============================================
// 5. ROOT ROUTE
// ============================================
app.use('/', indexRouter);

// ============================================
// 6. API ROUTES (with rate limiting)
// ============================================
app.use('/api', generalLimiter);

app.use('/api/users', usersRouter);
app.use('/api/checkin', checkinRouter);
app.use('/api/queue', queueRouter);
app.use('/api/admin', adminRouter);

// ============================================
// 7. ERROR HANDLING
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

logger.info('✅ Express app configured successfully');
logger.info('🔥 All routes mounted and ready');

export default app;
