import { IDebt } from '../../debts/types/debt.js';
import SharedDebtLinkModel from '../models/shared-debt-link.js';
import { ISharedDebtLink, ISharedDebtLinkRepository } from '../types/shared-debt-link.js';

export class SharedDebtLinksRepository implements ISharedDebtLinkRepository {
  async create(token: string, debtSnapshot: IDebt, createdBy: string): Promise<ISharedDebtLink> {
    return SharedDebtLinkModel.create({ token, debtSnapshot, createdBy });
  }

  async findByToken(token: string): Promise<ISharedDebtLink | null> {
    return SharedDebtLinkModel.findOne({ token });
  }
}
