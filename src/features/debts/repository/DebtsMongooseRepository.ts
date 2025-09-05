import '../../users/models/user.js';
import Debt from '../models/debt.js';
import { IDebt, IDebtCreate, IDebtFilter, IDebtRepository } from '../types/debt';

class DebtRepository implements IDebtRepository {
  private populateFields = '_id firstName lastName displayName email role';

  public async getDebts(): Promise<IDebt[]> {
    try {
      return await Debt.find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('debtor', this.populateFields)
        .populate('creditor', this.populateFields)
        .lean()
        .exec();
    } catch (err) {
      console.error('getDebts error:', err);
      throw err;
    }
  }

  public async getDebtsByFilter(filter: IDebtFilter = {}): Promise<IDebt[]> {
    return Debt.find(filter)
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('debtor', this.populateFields)
      .populate('creditor', this.populateFields)
      .lean()
      .exec();
  }

  public async getDebtById(id: string): Promise<IDebt | null> {
    return Debt.findById(id)
      .populate('debtor', this.populateFields)
      .populate('creditor', this.populateFields)
      .lean()
      .exec();
  }

  public async createDebt(debtData: IDebtCreate): Promise<IDebt> {
    const debt = new Debt({
      ...debtData,
      status: 'unpaid',
    });
    return debt.save().then((d) => d.toObject());
  }

  public async updateDebt(id: string, updatedData: Partial<IDebt>): Promise<IDebt | null> {
    return Debt.findByIdAndUpdate(id, updatedData, { new: true })
      .populate('debtor', this.populateFields)
      .populate('creditor', this.populateFields)
      .lean()
      .exec();
  }

  public async deleteDebt(id: string): Promise<IDebt | null> {
    return Debt.findByIdAndDelete(id).lean().exec();
  }

  public async markDebtAsPaid(id: string): Promise<IDebt | null> {
    return Debt.findByIdAndUpdate(id, { status: 'paid' }, { new: true }).lean().exec();
  }
}

export default DebtRepository;
