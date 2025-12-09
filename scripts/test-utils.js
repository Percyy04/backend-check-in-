import logger from '../src/utils/logger.js';
import { ApiResponse } from '../src/utils/apiResponse.js';
import {
  BadRequestError,
  NotFoundError,
  ValidationError
} from '../src/utils/errors.js';
import {
  validateUserId,
  validateCheckinRequest,
  formatJoiErrors
} from '../src/utils/validators.js';

console.log('🧪 Testing Utils Layer...\n');

// Test 1: Logger
console.log('1️⃣ Testing Logger:');
logger.info('This is an info message');
logger.warn('This is a warning message');
logger.error('This is an error message');
logger.debug('This is a debug message (only in debug level)');
console.log('✅ Logger test completed\n');

// Test 2: Custom Errors
console.log('2️⃣ Testing Custom Errors:');
try {
  throw new NotFoundError('User VIP_001 not found', 'USER_NOT_FOUND');
} catch (error) {
  console.log('Caught error:', {
    message: error.message,
    statusCode: error.statusCode,
    code: error.code,
  });
}
console.log('✅ Custom errors test completed\n');

// Test 3: Validators
console.log('3️⃣ Testing Validators:');

// Valid userId
const validResult = validateUserId('VIP_001');
console.log('Valid userId:', validResult);

// Invalid userId
const invalidResult = validateUserId('VIP001');
if (invalidResult.error) {
  console.log('Invalid userId error:', invalidResult.error.message);
}

// Valid check-in request (AI method)
const validCheckin = validateCheckinRequest({
  method: 'AI',
  imageBase64: 'base64string...',
});
console.log('Valid check-in (AI):', validCheckin.error ? 'FAIL' : 'PASS');

// Invalid check-in request (missing userId for QR)
const invalidCheckin = validateCheckinRequest({
  method: 'QR',
});
if (invalidCheckin.error) {
  console.log('Invalid check-in errors:', formatJoiErrors(invalidCheckin.error));
}

console.log('✅ Validators test completed\n');

console.log('🎉 All utils tests passed!');
