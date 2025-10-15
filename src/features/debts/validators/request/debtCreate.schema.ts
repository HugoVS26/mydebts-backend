import Joi from 'joi';
import mongoose from 'mongoose';

const objectIdOrString = Joi.string()
  .required()
  .custom((value, helpers) => {
    if (mongoose.Types.ObjectId.isValid(value) && value.length === 24) {
      return value;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
    return helpers.error('string.invalid');
  }, 'ObjectId or Name validation');

export const createDebtSchema = Joi.object({
  debtor: objectIdOrString.messages({
    'any.required': 'Debtor is required',
    'string.invalid': 'Debtor must be either a valid MongoDB ObjectId or a name',
  }),

  creditor: objectIdOrString.messages({
    'any.required': 'Creditor is required',
    'string.invalid': 'Creditor must be either a valid MongoDB ObjectId or a name',
  }),

  amount: Joi.number().required().min(1).max(10_000_000).messages({
    'any.required': 'Amount is required',
    'number.min': 'Amount must be positive',
    'number.max': 'Amount must be less than 10 million',
  }),

  description: Joi.string().trim().min(1).max(100).messages({
    'string.min': 'Description must have more than 1 character',
    'string.max': 'Description must be under 100 characters',
  }),

  debtDate: Joi.date()
    .max('now')
    .default(() => {
      const todayDate = new Date();
      todayDate.setUTCHours(0, 0, 0, 0);
      return todayDate;
    })
    .messages({
      'date.max': 'Debt date cannot be in the future',
    }),

  dueDate: Joi.date().min(Joi.ref('debtDate')).messages({
    'date.min': 'Due date must be equal to or after the debt date',
  }),

  status: Joi.string().valid('unpaid', 'paid', 'overdue').default('unpaid').messages({
    'any.only': 'Status must be either unpaid, paid, or overdue',
  }),
})
  .custom((value, helpers) => {
    const isDebtorObjectId =
      mongoose.Types.ObjectId.isValid(value.debtor) && value.debtor.length === 24;
    const isCreditorObjectId =
      mongoose.Types.ObjectId.isValid(value.creditor) && value.creditor.length === 24;

    if (isDebtorObjectId && isCreditorObjectId && value.debtor === value.creditor) {
      return helpers.error('any.invalid', {
        message: 'Debtor and creditor must be different users.',
      });
    }
    return value;
  }, 'Debtor-Creditor distinct validation')
  .messages({
    'any.invalid': '{{#message}}',
  });
