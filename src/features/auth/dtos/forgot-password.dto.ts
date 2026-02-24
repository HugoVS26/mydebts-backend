import Joi from 'joi';

export const ForgotPasswordDto = Joi.object({
  email: Joi.string().email().required(),
});

export interface ForgotPasswordInput {
  email: string;
}
