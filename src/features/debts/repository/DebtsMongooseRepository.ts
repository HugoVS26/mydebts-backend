import Debt from '../models/debt.js';
import { IDebt, IDebtCreate, DebtFilter, IDebtRepository } from '../types/debt';

class DebtRepository implements IDebtRepository {
  public async getDebts(): Promise<IDebt[]> {
    return Debt.find({}).sort({ createdAt: -1 }).limit(20).lean().exec();
  }

  public async getDebtsByFilter(filter: DebtFilter = {}): Promise<IDebt[]> {
    return Debt.find(filter).sort({ createdAt: -1 }).limit(20).lean().exec();
  }

  public async getDebtById(id: string): Promise<IDebt | null> {
    return Debt.findById(id).lean().exec();
  }

  public async createDebt(debtData: IDebtCreate): Promise<IDebt> {
    const debt = new Debt({
      ...debtData,
      status: 'unpaid',
    });
    return debt.save().then((d) => d.toObject()); // convert Document to plain object
  }

  public async updateDebt(
    id: string,
    updatedData: Partial<IDebt>
  ): Promise<IDebt | null> {
    return Debt.findByIdAndUpdate(id, updatedData, { new: true }).lean().exec();
  }

  public async deleteDebt(id: string): Promise<IDebt | null> {
    return Debt.findByIdAndDelete(id).lean().exec();
  }

  public async markDebtAsPaid(id: string): Promise<IDebt | null> {
    return Debt.findByIdAndUpdate(id, { status: 'paid' }, { new: true })
      .lean()
      .exec();
  }
}

export default DebtRepository;
