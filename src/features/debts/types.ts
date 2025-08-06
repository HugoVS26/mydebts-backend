import mongoose from 'mongoose';

export interface IDebt extends Document {
  debtor: mongoose.Types.ObjectId;
  creditor: mongoose.Types.ObjectId;
  amount: number;
  description?: string;
  debtDate: Date;
  dueDate?: Date;
  status: 'unpaid' | 'paid' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
}
