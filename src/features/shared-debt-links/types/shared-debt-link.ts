import mongoose from 'mongoose';
import { IDebt } from '../../debts/types/debt.js';

export interface ISharedDebtLink {
  _id: mongoose.Types.ObjectId;
  token: string;
  debtSnapshot: IDebt;
  expiresAt: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ISharedDebtLinkRepository {
  create(token: string, debtSnapshot: IDebt, createdBy: string): Promise<ISharedDebtLink>;
  findByToken(token: string): Promise<ISharedDebtLink | null>;
}
