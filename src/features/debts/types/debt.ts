import mongoose from 'mongoose';

export interface IDebt {
  _id: mongoose.Types.ObjectId;
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

export interface IDebtCreate {
  debtor: mongoose.Types.ObjectId;
  creditor: mongoose.Types.ObjectId;
  amount: number;
  debtDate: Date;
  description?: string;
  dueDate?: Date;
}

export type DebtFilter = Partial<IDebt>;

export interface IDebtRepository {
  getDebts(): Promise<IDebt[]>;
  getDebtsByFilter(filter: DebtFilter, limit?: number): Promise<IDebt[]>;
  getDebtById(id: string): Promise<IDebt | null>;
  createDebt(debtData: IDebtCreate): Promise<IDebt>;
  updateDebt(id: string, updateData: Partial<IDebt>): Promise<IDebt | null>;
  deleteDebt(id: string): Promise<IDebt | null>;
  markDebtAsPaid(id: string): Promise<IDebt | null>;
}
