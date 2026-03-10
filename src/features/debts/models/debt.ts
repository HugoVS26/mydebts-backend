import mongoose, { Schema } from 'mongoose';
import { IDebt } from '../types/debt.js';

import {
  debtDateValidator,
  debtDateValidatorMessage,
} from '../validators/schema/debtDate.validator.js';
import dueDateValidator from '../validators/schema/dueDate.validator.js';
import counterpartyValidator from '../validators/schema/counterparty.validator.js';

const DebtSchema = new Schema<IDebt>(
  {
    debtor: {
      type: Schema.Types.Mixed,
      required: [true, 'Debtor is required'],
      validate: counterpartyValidator,
    },
    creditor: {
      type: Schema.Types.Mixed,
      required: [true, 'Creditor is required'],
      validate: counterpartyValidator,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be at least 0.01'],
      max: [10000000, 'Amount must be less than 10 million'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [1, 'Description must have at least 1 character'],
      maxlength: [100, 'Description must be under 100 characters'],
    },
    debtDate: {
      type: Date,
      default: Date.now,
      validate: {
        validator: debtDateValidator,
        message: debtDateValidatorMessage,
      },
    },
    dueDate: {
      type: Date,
      validate: dueDateValidator,
    },
    status: {
      type: String,
      enum: {
        values: ['unpaid', 'paid', 'overdue'],
        message: 'Status must be either unpaid, paid, or overdue',
      },
      default: 'unpaid',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model<IDebt>('Debt', DebtSchema);
