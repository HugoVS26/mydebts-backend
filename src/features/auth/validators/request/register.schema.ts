import Joi from 'joi';

export const registerSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(1)
    .max(20)
    .pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-']+$/)
    .required()
    .messages({
      'string.min': 'First name must be at least 1 character',
      'string.max': 'First name must be at most 20 characters',
      'string.pattern.base':
        'First name can only contain letters, spaces, hyphens, and apostrophes',
      'any.required': 'First name is required',
    }),
  lastName: Joi.string()
    .trim()
    .min(1)
    .max(20)
    .pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-']+$/)
    .required()
    .messages({
      'string.min': 'Last name must be at least 1 character',
      'string.max': 'Last name must be at most 20 characters',
      'string.pattern.base': 'Last name can only contain letters, spaces, hyphens, and apostrophes',
      'any.required': 'Last name is required',
    }),
  email: Joi.string().trim().lowercase().email().max(100).required().messages({
    'string.email': 'Invalid email format',
    'string.max': 'Email must be at most 100 characters',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password must be at most 100 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
});
