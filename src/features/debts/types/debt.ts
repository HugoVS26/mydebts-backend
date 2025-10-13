import mongoose from 'mongoose';

export interface IDebtBase {
  _id: mongoose.Types.ObjectId;
  amount: number;
  description: string;
  debtDate: Date;
  dueDate?: Date;
  status: 'unpaid' | 'paid' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
}

export interface IDebt extends IDebtBase {
  debtor: mongoose.Types.ObjectId | string;
  creditor: mongoose.Types.ObjectId | string;
}

export interface IDebtCreate {
  debtor: mongoose.Types.ObjectId | string;
  creditor: mongoose.Types.ObjectId | string;
  amount: number;
  debtDate?: Date;
  description: string;
  dueDate?: Date;
}

export interface IDebtUpdate {
  amount?: number;
  description: string;
  dueDate?: Date;
}

export type IDebtFilter = Partial<
  IDebtBase & { debtor?: mongoose.Types.ObjectId; creditor?: mongoose.Types.ObjectId }
>;

export interface IDebtRepository {
  getDebts(): Promise<IDebt[]>;
  getDebtsByFilter(filter: IDebtFilter, limit?: number): Promise<IDebt[]>;
  getDebtById(id: string): Promise<IDebt | null>;
  createDebt(debtData: IDebtCreate): Promise<IDebt>;
  updateDebt(
    id: string,
    updateData: Partial<
      IDebtBase & { debtor?: mongoose.Types.ObjectId; creditor?: mongoose.Types.ObjectId }
    >
  ): Promise<IDebt | null>;
  deleteDebt(id: string): Promise<IDebt | null>;
  markDebtAsPaid(id: string): Promise<IDebt | null>;
}
