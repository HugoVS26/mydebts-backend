import { Request, Response } from 'express';
import { IDebtCreate, DebtFilter, IDebtRepository } from '../types/debt';
import CustomError from '../../../server/middlewares/errors/CustomError/CustomError.js';
import {
  DebtRequestByFilter,
  DebtRequestById,
  DebtRequestWithoutId,
} from '../types/requests';
import mongoose from 'mongoose';

class DebtsController {
  constructor(private readonly debtRepository: IDebtRepository) {}

  public async getDebts(_req: Request, res: Response): Promise<void> {
    try {
      const debts = await this.debtRepository.getDebts();

      res.status(200).json({ message: 'Debts fetched succesfully!', debts });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw error;
      }

      this.handleError(error, 'Error fetching debts', 'Could not get debts');
    }
  }

  public async getDebtsByFilter(
    req: DebtRequestByFilter,
    res: Response
  ): Promise<void> {
    try {
      const filter: DebtFilter = req.query || {};
      const debts = await this.debtRepository.getDebtsByFilter(filter);

      res
        .status(200)
        .json({ message: 'Filtered debts fetched succesfully!', debts });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw error;
      }

      this.handleError(
        error,
        'Error filtering debts',
        'Could not filter debts'
      );
    }
  }

  public async getDebtById(req: DebtRequestById, res: Response): Promise<void> {
    try {
      const { debtId } = req.params;
      const debt = await this.debtRepository.getDebtById(debtId);

      if (!debt) {
        throw new CustomError('Debt not found', 404, 'Debt not found');
      }

      res.status(200).json({ message: 'Debt fetched succesfully!', debt });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw error;
      }

      this.handleError(error, 'Error fetching debt', 'Could not get debt');
    }
  }

  public async createDebt(
    req: DebtRequestWithoutId,
    res: Response
  ): Promise<void> {
    try {
      const debtData: IDebtCreate = req.body;
      const newDebt = await this.debtRepository.createDebt(debtData);

      res
        .status(201)
        .json({ message: 'Debt succesfully created!', debt: newDebt });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw error;
      }

      this.handleError(error, 'Error creating debt', 'Could not create debt');
    }
  }

  public async updateDebt(req: DebtRequestById, res: Response): Promise<void> {
    try {
      const { debtId } = req.params;
      const debtData: Partial<IDebtCreate> = req.body;
      const updatedDebt = await this.debtRepository.updateDebt(
        debtId,
        debtData
      );

      if (!updatedDebt) {
        throw new CustomError('Debt not found', 404, 'Debt not found');
      }

      res
        .status(200)
        .json({ message: 'Debt succesfully updated!', debt: updatedDebt });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw error;
      }

      this.handleError(error, 'Error updating debt', 'Could not update debt');
    }
  }

  public async deleteDebt(req: DebtRequestById, res: Response): Promise<void> {
    try {
      const { debtId } = req.params;
      const deletedDebt = await this.debtRepository.deleteDebt(debtId);

      if (!deletedDebt) {
        throw new CustomError('Debt not found', 404, 'Debt not found');
      }

      res
        .status(200)
        .json({ message: 'Debt succesfully deleted!', debt: deletedDebt });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw error;
      }

      this.handleError(error, 'Error deleting debt', 'Could not delete debt');
    }
  }

  public async markDebtAsPaid(
    req: DebtRequestById,
    res: Response
  ): Promise<void> {
    try {
      const { debtId } = req.params;
      const updatedDebt = await this.debtRepository.markDebtAsPaid(debtId);

      if (!updatedDebt) {
        throw new CustomError('Debt not found', 404, 'Debt not found');
      }

      res
        .status(200)
        .json({ message: 'Debt succesfully marked!', debt: updatedDebt });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw error;
      }

      this.handleError(
        error,
        'Error marking debt',
        'Could not update debt status'
      );
    }
  }

  private handleError(
    error: unknown,
    message: string,
    publicMessage: string,
    statusCode = 500
  ): never {
    if (error instanceof CustomError) throw error;
    throw new CustomError(message, statusCode, publicMessage);
  }
}

export default DebtsController;
