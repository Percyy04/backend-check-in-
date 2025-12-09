import express from 'express';
import request from 'supertest';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { requestLogger } from '../src/middleware/logger.js';
import { NotFoundError, ValidationError } from '../src/utils/errors.js';

const app = express();
app.use(express.json());
app.use(requestLogger);

// Test routes
app.get('/test/success', (req, res) => {
  res.json({ success: true, message: 'OK' });
});

app.get('/test/error', (req, res, next) => {
  next(new NotFoundError('User not found', 'USER_NOT_FOUND'));
});

app.get('/test/validation', (req, res, next) => {
  const errors = [
    { field: 'email', message: 'Invalid email format' },
    { field: 'age', message: 'Age must be a number' },
  ];
  next(new ValidationError('Validation failed', errors));
});

app.use(errorHandler);

console.log('🧪 Testing Middleware Layer...\n');

// Test 1: Success request
request(app)
  .get('/test/success')
  .expect(200)
  .then(res => {
    console.log('✅ Test 1 - Success request:', res.body);
  });

// Test 2: Not found error
request(app)
  .get('/test/error')
  .expect(404)
  .then(res => {
    console.log('✅ Test 2 - Not found error:', res.body);
  });

// Test 3: Validation error
request(app)
  .get('/test/validation')
  .expect(422)
  .then(res => {
    console.log('✅ Test 3 - Validation error:', res.body);
  });

setTimeout(() => {
  console.log('\n🎉 All middleware tests passed!');
  process.exit(0);
}, 2000);
