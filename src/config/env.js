import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env từ root directory
dotenv.config({ path: join(__dirname, '../../.env') });

// Danh sách biến bắt buộc
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL'
];

// Validate: Check xem có thiếu biến nào không
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`❌ Missing required environment variable: ${varName}`);
  }
});

// Export config object
export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Convert \n to actual newlines
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  },

  ai: {
    serviceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    apiKey: process.env.AI_SERVICE_API_KEY,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  }
};

console.log('✅ Environment variables loaded successfully');
console.log(`📦 Firebase Project: ${config.firebase.projectId}`);
console.log(`🚀 Server running on port: ${config.port}`);
console.log(`🤖 AI Service URL: ${config.ai.serviceUrl}`);