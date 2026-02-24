import Joi from 'joi';

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

export const ResetPasswordDto = Joi.object({
  token: Joi.string().min(1).required(),
  newPassword: Joi.string().min(8).pattern(strongPasswordRegex).required().messages({
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  }),
});

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}
