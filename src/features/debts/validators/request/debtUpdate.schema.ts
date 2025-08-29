import Joi from 'joi';

export const updateDebtSchema = Joi.object({
  debtor: Joi.string().hex().length(24).messages({
    'string.base': 'Debtor must be a string',
    'string.hex': 'Debtor must be a valid ObjectId',
    'string.length': 'Debtor must be 24 characters long',
  }),

  creditor: Joi.string().hex().length(24).messages({
    'string.base': 'Creditor must be a string',
    'string.hex': 'Creditor must be a valid ObjectId',
    'string.length': 'Creditor must be 24 characters long',
  }),

  amount: Joi.number().min(1).max(10_000_000).messages({
    'number.min': 'Amount must be positive',
    'number.max': 'Amount must be less than 10 million',
  }),

  description: Joi.string().max(200).messages({
    'string.max': 'Description must be under 200 characters',
  }),

  debtDate: Joi.date().max('now').messages({
    'date.max': 'Debt date cannot be in the future',
  }),

  dueDate: Joi.date().when('debtDate', {
    is: Joi.exist(),
    then: Joi.date().min(Joi.ref('debtDate')).messages({
      'date.min': 'Due date must be equal to or after the debt date',
    }),
    otherwise: Joi.date(),
  }),

  status: Joi.string().valid('unpaid', 'paid', 'overdue'),
})
  .custom((value, helpers) => {
    if (value.debtor && value.creditor && value.debtor === value.creditor) {
      return helpers.error('any.invalid', {
        message: 'Debtor and creditor must be different users.',
      });
    }
    return value;
  }, 'Debtor and Creditor distinct validation')
  .min(1)
  .messages({
    'any.invalid': '{{#message}}',
  });
