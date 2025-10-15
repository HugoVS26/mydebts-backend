import Joi from 'joi';

export const updateDebtSchema = Joi.object({
  amount: Joi.number().min(1).max(10_000_000).messages({
    'number.min': 'Amount must be positive',
    'number.max': 'Amount must be less than 10 million',
  }),

  description: Joi.string().min(1).max(100).messages({
    'string.min': 'Description must have more than 1 character',
    'string.max': 'Description must be under 100 characters',
  }),

  dueDate: Joi.date().messages({
    'date.min': 'Due date must be equal to or after the debt date',
  }),
})
  .min(1)
  .messages({
    'object.min': 'You must provide at least one field to update',
  });
