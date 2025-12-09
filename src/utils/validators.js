import Joi from 'joi';

/**
 * Validate userId format (VIP_001, STAFF_123, etc.)
 */
export const validateUserId = (userId) => {
  const schema = Joi.string()
    .pattern(/^(VIP|STAFF|GUEST)_\d{3}$/)
    .required()
    .messages({
      'string.pattern.base': 'UserId must follow format: VIP_001, STAFF_001, GUEST_001',
      'any.required': 'UserId is required',
    });

  return schema.validate(userId);
};

/**
 * Validate check-in request body
 */
export const validateCheckinRequest = (data) => {
  const schema = Joi.object({
    method: Joi.string()
      .valid('AI', 'QR', 'MANUAL')
      .required()
      .messages({
        'any.only': 'Method must be one of: AI, QR, MANUAL',
      }),

    // Cho AI method
    imageBase64: Joi.string().when('method', {
      is: 'AI',
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),

    // Cho QR/Manual method
    userId: Joi.string().when('method', {
      is: Joi.valid('QR', 'MANUAL'),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate create user request
 */
export const validateCreateUser = (data) => {
  const schema = Joi.object({
    userId: Joi.string()
      .pattern(/^(VIP|STAFF|GUEST)_\d{3}$/)
      .required(),

    name: Joi.string()
      .min(2)
      .max(100)
      .required(),

    isVIP: Joi.boolean()
      .required(),

    seat: Joi.string()
      .pattern(/^[A-Z]\d{1,2}$/)
      .required()
      .messages({
        'string.pattern.base': 'Seat must follow format: A12, B5, etc.',
      }),

    videoUrl: Joi.string()
      .uri()
      .when('isVIP', {
        is: true,
        then: Joi.required(),
        otherwise: Joi.optional(),
      }),

    email: Joi.string()
      .email()
      .optional(),

    phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .optional(),
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Helper: Format Joi validation errors
 */
export const formatJoiErrors = (error) => {
  return error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message,
  }));
};
