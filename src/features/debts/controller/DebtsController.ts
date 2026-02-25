import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { IDebtCreate, IDebtFilter, IDebtRepository, IDebtUpdate } from '../types/debt';
import CustomError from '../../../server/middlewares/errors/CustomError/CustomError.js';
import { DebtRequestByFilter, DebtRequestById, DebtRequestWithoutId } from '../types/requests';
import { updateDebtSchema } from '../validators/request/debtUpdate.schema.js';
import Joi from 'joi';
import { AuthRequest } from '../../auth/middlewares/authMiddleware';

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

  public async getDebtsByFilter(req: DebtRequestByFilter, res: Response): Promise<void> {
    try {
      const filter: IDebtFilter = req.query || {};
      const debts = await this.debtRepository.getDebtsByFilter(filter);

      res.status(200).json({ message: 'Filtered debts fetched succesfully!', debts });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw error;
      }

      this.handleError(error, 'Error filtering debts', 'Could not filter debts');
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

  public async createDebt(req: DebtRequestWithoutId, res: Response): Promise<void> {
    try {
      const {
        debtor,
        creditor,
        amount,
        debtDate: debtDateInput,
        dueDate: dueDateInput,
        description,
      } = req.body;

      const debtDate = debtDateInput ? new Date(debtDateInput) : new Date();
      debtDate.setUTCHours(0, 0, 0, 0);

      let dueDate: Date | undefined;
      if (dueDateInput) {
        dueDate = new Date(dueDateInput);
        dueDate.setUTCHours(0, 0, 0, 0);
      }

      const debtorValue = mongoose.Types.ObjectId.isValid(debtor)
        ? new mongoose.Types.ObjectId(debtor)
        : debtor;

      const creditorValue = mongoose.Types.ObjectId.isValid(creditor)
        ? new mongoose.Types.ObjectId(creditor)
        : creditor;

      const debtData: IDebtCreate = {
        debtor: debtorValue,
        creditor: creditorValue,
        amount,
        description,
        debtDate,
        dueDate,
      };

      const newDebt = await this.debtRepository.createDebt(debtData);

      res.status(201).json({ message: 'Debt succesfully created!', debt: newDebt });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) throw error;
      this.handleError(error, 'Error creating debt', 'Could not create debt');
    }
  }

  public async updateDebt(req: DebtRequestById, res: Response): Promise<void> {
    try {
      const { debtId } = req.params;

      const existingDebt = await this.debtRepository.getDebtById(debtId);
      if (!existingDebt) throw new CustomError('Debt not found', 404, 'Debt not found');

      await updateDebtSchema.validateAsync(req.body, {
        abortEarly: false,
      });

      if (req.body.dueDate) {
        const dueDate = new Date(req.body.dueDate);
        dueDate.setUTCHours(0, 0, 0, 0);

        const debtDate = new Date(existingDebt.debtDate);
        debtDate.setUTCHours(0, 0, 0, 0);

        if (dueDate < debtDate) {
          throw new CustomError(
            'Validation failed',
            400,
            'Due date must be equal to or after the debt date'
          );
        }
      }

      let dueDate: Date | undefined;
      if (req.body.dueDate) {
        dueDate = new Date(req.body.dueDate);
        dueDate.setUTCHours(0, 0, 0, 0);
      }

      const debtData: Partial<IDebtUpdate> = {};
      if (req.body.amount !== undefined) debtData.amount = req.body.amount;
      if (req.body.description !== undefined) debtData.description = req.body.description;
      if (dueDate !== undefined) debtData.dueDate = dueDate;

      const updatedDebt = await this.debtRepository.updateDebt(debtId, debtData);

      res.status(200).json({ message: 'Debt successfully updated!', debt: updatedDebt });
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        throw new CustomError(
          'Validation failed',
          400,
          error.details.map((d) => d.message).join('; ')
        );
      }

      if (error instanceof mongoose.Error.ValidationError) throw error;
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

      res.status(200).json({ message: 'Debt succesfully deleted!', debt: deletedDebt });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw error;
      }

      this.handleError(error, 'Error deleting debt', 'Could not delete debt');
    }
  }

  public async markDebtAsPaid(req: DebtRequestById, res: Response): Promise<void> {
    try {
      const { debtId } = req.params;
      const updatedDebt = await this.debtRepository.markDebtAsPaid(debtId);

      if (!updatedDebt) {
        throw new CustomError('Debt not found', 404, 'Debt not found');
      }

      res.status(200).json({ message: 'Debt succesfully marked!', debt: updatedDebt });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw error;
      }

      this.handleError(error, 'Error marking debt', 'Could not update debt status');
    }
  }

  public async deleteAllPaidDebts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req;
      const mode = req.query['mode'] as 'creditor' | 'debtor';

      if (!userId) {
        throw new CustomError('User not authenticated', 401, 'Authentication required');
      }

      if (mode !== 'creditor' && mode !== 'debtor') {
        throw new CustomError('Invalid mode', 400, 'Mode must be creditor or debtor');
      }

      const deletedCount = await this.debtRepository.deleteAllPaidDebts(userId, mode);
      res.status(200).json({ message: `${deletedCount} paid debt(s) successfully deleted.` });
    } catch (error) {
      this.handleError(error, 'Error deleting paid debts', 'Could not delete paid debts');
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
