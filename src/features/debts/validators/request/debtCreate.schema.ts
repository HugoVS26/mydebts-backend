import Joi from 'joi';

export const createDebtSchema = Joi.object({
  debtor: Joi.string().required().hex().length(24).messages({
    'any.required': 'Debtor is required',
    'string.hex': 'Debtor must be a valid MongoDB ObjectId',
    'string.length': 'Debtor must be 24 characters long',
  }),

  creditor: Joi.string().required().hex().length(24).messages({
    'any.required': 'Creditor is required',
    'string.hex': 'Creditor must be a valid MongoDB ObjectId',
    'string.length': 'Creditor must be 24 characters long',
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

  debtDate: Joi.date().required().max('now').messages({
    'any.required': 'Debt date is required',
    'date.max': 'Debt date cannot be in the future',
  }),

  dueDate: Joi.date().when('debtDate', {
    is: Joi.exist(),
    then: Joi.date().min(Joi.ref('debtDate')).messages({
      'date.min': 'Due date must be equal to or after the debt date',
    }),
    otherwise: Joi.date(),
  }),

  status: Joi.string().valid('unpaid', 'paid', 'overdue').default('unpaid').messages({
    'any.only': 'Status must be either unpaid, paid, or overdue',
  }),
})
  .custom((value, helpers) => {
    if (value.debtor && value.creditor && value.debtor === value.creditor) {
      return helpers.error('any.invalid', {
        message: 'Debtor and creditor must be different users.',
      });
    }
    return value;
  }, 'Debtor-Creditor distinct validation')
  .messages({
    'any.invalid': '{{#message}}',
  });
