import mongoose, { Schema } from 'mongoose';
import { IDebt } from '../types/debt';

import {
  debtDateValidator,
  debtDateValidatorMessage,
} from '../validators/schema/debtDate.validator.js';
import dueDateValidator from '../validators/schema/dueDate.validator.js';

const DebtSchema = new Schema<IDebt>(
  {
    debtor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Debtor is required'],
    },
    creditor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creditor is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be positive'],
      max: [10000000, 'Amount must be less than 10 million'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      min: [1, 'Description must have 1 character at least'],
      maxlength: [100, 'Description must be under 200 characters'],
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

DebtSchema.pre('validate', function (this: IDebt & mongoose.Document, next) {
  if (this.debtor && this.creditor && this.debtor.toString() === this.creditor.toString()) {
    this.invalidate('creditor', 'Debtor and creditor must be different users.');
  }
  next();
});

export default mongoose.model<IDebt>('Debt', DebtSchema);
