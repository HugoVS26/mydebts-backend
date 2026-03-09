import mongoose from 'mongoose';
import '../../users/models/user.js';
import Debt from '../models/debt.js';
import { IDebt, IDebtCreate, IDebtFilter, IDebtRepository } from '../types/debt.js';

class DebtRepository implements IDebtRepository {
  private populateFields = '_id firstName lastName displayName email role';

  private async populateField(value: mongoose.Types.ObjectId | string): Promise<unknown> {
    if (mongoose.Types.ObjectId.isValid(value as string)) {
      const User = mongoose.model('User');
      const user = await User.findById(value).select(this.populateFields).lean();
      return user ?? value;
    }
    return value;
  }

  private async populateDebt(debt: IDebt): Promise<IDebt> {
    const [debtor, creditor] = await Promise.all([
      this.populateField(debt.debtor as string),
      this.populateField(debt.creditor as string),
    ]);
    return { ...debt, debtor, creditor } as IDebt;
  }

  private async populateDebts(debts: IDebt[]): Promise<IDebt[]> {
    return Promise.all(debts.map((debt) => this.populateDebt(debt)));
  }

  public async getDebts(userId: string): Promise<IDebt[]> {
    const objectId = new mongoose.Types.ObjectId(userId);
    await this.updateOverdueDebts(objectId);

    const debts = await Debt.find({
      $or: [{ creditor: objectId }, { debtor: objectId }],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
      .exec();

    return this.populateDebts(debts);
  }

  private async updateOverdueDebts(userId: mongoose.Types.ObjectId): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Debt.updateMany(
      {
        $or: [{ creditor: userId }, { debtor: userId }],
        status: 'unpaid',
        dueDate: { $lt: today },
      },
      { $set: { status: 'overdue', updatedAt: new Date() } }
    );
  }

  public async getDebtsByFilter(filter: IDebtFilter = {}): Promise<IDebt[]> {
    const debts = await Debt.find(filter).sort({ createdAt: -1 }).limit(20).lean().exec();

    return this.populateDebts(debts);
  }

  public async getDebtById(id: string): Promise<IDebt | null> {
    const debt = await Debt.findById(id).lean().exec();
    if (!debt) return null;
    return this.populateDebt(debt);
  }

  public async createDebt(debtData: IDebtCreate): Promise<IDebt> {
    const debt = new Debt({ ...debtData, status: 'unpaid' });
    return debt.save().then((d) => d.toObject());
  }

  public async updateDebt(id: string, updatedData: Partial<IDebt>): Promise<IDebt | null> {
    const debt = await Debt.findByIdAndUpdate(id, updatedData, { new: true }).lean().exec();
    if (!debt) return null;
    return this.populateDebt(debt);
  }

  public async deleteDebt(id: string): Promise<IDebt | null> {
    return Debt.findByIdAndDelete(id).lean().exec();
  }

  public async markDebtAsPaid(id: string): Promise<IDebt | null> {
    const debt = await Debt.findByIdAndUpdate(id, { status: 'paid' }, { new: true }).lean().exec();
    if (!debt) return null;
    return this.populateDebt(debt);
  }

  public async deleteAllPaidDebts(userId: string, mode: 'creditor' | 'debtor'): Promise<number> {
    const filter = {
      status: 'paid',
      [mode]: new mongoose.Types.ObjectId(userId),
    };
    const result = await Debt.deleteMany(filter);
    return result.deletedCount;
  }
}

export default DebtRepository;
