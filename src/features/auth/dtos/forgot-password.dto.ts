import Joi from 'joi';

export const ForgotPasswordDto = Joi.object({
  email: Joi.string().email().required(),
  turnstileToken: Joi.string().required(),
});

export interface ForgotPasswordInput {
  email: string;
}
