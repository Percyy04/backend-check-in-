import { ValidationError } from '../utils/errors.js';
import { formatJoiErrors } from '../utils/validators.js';

/**
 * Validate Request Body
 * Generic validator middleware
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const formattedErrors = formatJoiErrors(error);
      return next(new ValidationError('Validation failed', 'VALIDATION_ERROR', formattedErrors));
    }

    // Replace req.body với validated & sanitized data
    req.body = value;
    next();
  };
};

/**
 * Validate Request Params
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false
    });

    if (error) {
      const formattedErrors = formatJoiErrors(error);
      return next(new ValidationError('Invalid parameters', 'VALIDATION_ERROR', formattedErrors));
    }

    req.params = value;
    next();
  };
};

/**
 * Validate Request Query
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false
    });

    if (error) {
      const formattedErrors = formatJoiErrors(error);
      return next(new ValidationError('Invalid query parameters', 'VALIDATION_ERROR', formattedErrors));
    }

    req.query = value;
    next();
  };
};
