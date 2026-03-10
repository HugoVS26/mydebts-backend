import mongoose from 'mongoose';
import nameValidator from '../../../users/validators/name.validator.js';

const counterpartyValidator = {
  validator: function (value: unknown) {
    if (mongoose.Types.ObjectId.isValid(value as string)) return true;
    if (typeof value === 'string' && value.length >= 1 && value.length <= 50)
      return nameValidator.validator(value);
    return false;
  },
  message: ({ value }: { value: unknown }) =>
    typeof value === 'string'
      ? `"${value}" is not a valid name. Must be between 1 and 50 characters, only letters, spaces, hyphens, and apostrophes allowed.`
      : 'Counterparty must be a valid user reference or a name.',
};

export default counterpartyValidator;
