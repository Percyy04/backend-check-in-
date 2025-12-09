import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

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
import uploadRouter from './src/routes/upload.routes.js';
import authRouter from './src/routes/auth.routes.js';
import importRouter from './src/routes/import.routes.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============================================
// 1. SECURITY & PERFORMANCE MIDDLEWARE
// ============================================
app.use(helmet({
  contentSecurityPolicy: false, // Allow Swagger UI to load
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
// 5. SWAGGER DOCUMENTATION
// ============================================
if (existsSync('./swagger-output.json')) {
  try {
    const swaggerDocument = JSON.parse(
      readFileSync('./swagger-output.json', 'utf8')
    );

    // Serve swagger UI
    app.use('/api-docs', swaggerUi.serve);
    app.get('/api-docs', swaggerUi.setup(swaggerDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Gala Brosis 2025 API Docs',
      swaggerOptions: {
        persistAuthorization: true,
      },
    }));

    // Swagger JSON endpoint
    app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerDocument);
    });

    logger.info('📚 Swagger UI available at /api-docs');
  } catch (error) {
    logger.error('Failed to load Swagger:', error.message);
  }
} else {
  logger.warn('⚠️  swagger-output.json not found. Run: npm run swagger');
}

// ============================================
// 6. ROOT ROUTE
// ============================================
app.use('/', indexRouter);

// ============================================
// 7. API ROUTES (with rate limiting)
// ============================================
app.use('/api', generalLimiter);
app.use('/api/auth', authRouter); // Auth routes (login) - before rate limit
app.use('/api/users', usersRouter);
app.use('/api/checkin', checkinRouter);
app.use('/api/queue', queueRouter);
app.use('/api/admin', adminRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/import', importRouter);


// ============================================
// 8. ERROR HANDLING (PHẢI Ở CUỐI CÙNG)
// ============================================
app.use(notFoundHandler);
app.use(errorHandler);

logger.info('✅ Express app configured successfully');
logger.info('🔥 All routes mounted and ready');

export default app;
