import crypto from 'crypto';
import { IDebt, IDebtRepository } from '../../debts/types/debt.js';
import { ISharedDebtLinkRepository } from '../types/shared-debt-link.js';
import CustomError from '../../../server/middlewares/errors/CustomError/CustomError.js';

export class SharedDebtLinksService {
  constructor(
    private readonly sharedDebtLinksRepository: ISharedDebtLinkRepository,
    private readonly debtsRepository: IDebtRepository
  ) {}

  async createShareLink(debtId: string, userId: string): Promise<string> {
    const debt = await this.debtsRepository.getDebtById(debtId);
    if (!debt) throw new CustomError('Debt not found', 404, 'Debt not found');

    const token = crypto.randomBytes(32).toString('hex');
    const snapshot = JSON.parse(JSON.stringify(debt));
    await this.sharedDebtLinksRepository.create(token, snapshot, userId);

    return token;
  }

  async getByToken(token: string): Promise<IDebt> {
    const link = await this.sharedDebtLinksRepository.findByToken(token);
    if (!link) throw new CustomError('Link not found or expired', 404, 'Link not found or expired');

    return link.debtSnapshot;
  }
}
