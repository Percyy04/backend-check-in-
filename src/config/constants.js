// User roles
export const USER_ROLES = {
  VIP: 'VIP',
  STAFF: 'STAFF',
  GUEST: 'GUEST',
};

// Check-in status
export const CHECKIN_STATUS = {
  PENDING: 'PENDING',
  CHECKED_IN: 'CHECKED_IN',
  FAILED: 'FAILED',
};

// Queue status (cho LED display)
export const QUEUE_STATUS = {
  WAITING: 'WAITING',
  PLAYING: 'PLAYING',
  DONE: 'DONE',
  ERROR: 'ERROR',
};

// Check-in methods
export const CHECKIN_METHODS = {
  AI: 'AI',
  QR: 'QR',
  MANUAL: 'MANUAL',
};

// Firestore collection names
export const COLLECTIONS = {
  USERS: 'users',
  CHECKIN_QUEUE: 'checkin_queue',
  SYSTEM_LOGS: 'system_logs',
  CHECKIN_HISTORY: 'checkin_history',
};

// Error codes
export const ERROR_CODES = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ALREADY_CHECKED_IN: 'ALREADY_CHECKED_IN',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  INVALID_QR_CODE: 'INVALID_QR_CODE',
  QUEUE_FULL: 'QUEUE_FULL',
};

// Business rules
export const BUSINESS_RULES = {
  MAX_QUEUE_LENGTH: 10,
  CHECKIN_COOLDOWN_MINUTES: 5,
  VIDEO_MAX_DURATION_SECONDS: 30,
};
