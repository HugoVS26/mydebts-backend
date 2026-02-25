import { Response } from 'express';

import DebtsMongooseRepository from '../../repository/DebtsRepository';
import DebtsController from '../DebtsController';
import CustomError from '../../../../server/middlewares/errors/CustomError/CustomError';
import { IDebtRepository } from '../../types/debt';
import { AuthRequest } from '../../../auth/middlewares/authMiddleware';

const mockUserId = '64e52d9f1a2b3c4d5e6f7a01';

const mockRequest = (mode: 'creditor' | 'debtor', userId = mockUserId): Partial<AuthRequest> => ({
  userId,
  query: { mode },
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Given the deleteAllPaidDebts method in DebtsController', () => {
  const res: Pick<Response, 'status' | 'json'> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  describe('When it receives a valid request as creditor', () => {
    const debtRepository: Pick<IDebtRepository, 'deleteAllPaidDebts'> = {
      deleteAllPaidDebts: jest.fn().mockResolvedValue(3),
    };
    const debtsController = new DebtsController(debtRepository as DebtsMongooseRepository);

    it('Should respond with status 200 and deleted count message', async () => {
      await debtsController.deleteAllPaidDebts(
        mockRequest('creditor') as AuthRequest,
        res as Response
      );

      expect(debtRepository.deleteAllPaidDebts).toHaveBeenCalledWith(mockUserId, 'creditor');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: '3 paid debt(s) successfully deleted.' });
    });
  });

  describe('When it receives a valid request as debtor', () => {
    const debtRepository: Pick<IDebtRepository, 'deleteAllPaidDebts'> = {
      deleteAllPaidDebts: jest.fn().mockResolvedValue(2),
    };
    const debtsController = new DebtsController(debtRepository as DebtsMongooseRepository);

    it('Should respond with status 200 and deleted count message', async () => {
      await debtsController.deleteAllPaidDebts(
        mockRequest('debtor') as AuthRequest,
        res as Response
      );

      expect(debtRepository.deleteAllPaidDebts).toHaveBeenCalledWith(mockUserId, 'debtor');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: '2 paid debt(s) successfully deleted.' });
    });
  });

  describe('When no paid debts exist', () => {
    const debtRepository: Pick<IDebtRepository, 'deleteAllPaidDebts'> = {
      deleteAllPaidDebts: jest.fn().mockResolvedValue(0),
    };
    const debtsController = new DebtsController(debtRepository as DebtsMongooseRepository);

    it('Should respond with status 200 and zero deleted count', async () => {
      await debtsController.deleteAllPaidDebts(
        mockRequest('creditor') as AuthRequest,
        res as Response
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: '0 paid debt(s) successfully deleted.' });
    });
  });

  describe('When userId is missing', () => {
    const debtRepository: Pick<IDebtRepository, 'deleteAllPaidDebts'> = {
      deleteAllPaidDebts: jest.fn(),
    };
    const debtsController = new DebtsController(debtRepository as DebtsMongooseRepository);

    it('Should throw a CustomError with status 401', async () => {
      const req: Partial<AuthRequest> = { userId: undefined, query: { mode: 'creditor' } };

      try {
        await debtsController.deleteAllPaidDebts(req as AuthRequest, res as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).statusCode).toBe(401);
        expect((error as CustomError).publicMessage).toBe('Authentication required');
      }

      expect(debtRepository.deleteAllPaidDebts).not.toHaveBeenCalled();
    });
  });

  describe('When mode is invalid', () => {
    const debtRepository: Pick<IDebtRepository, 'deleteAllPaidDebts'> = {
      deleteAllPaidDebts: jest.fn(),
    };
    const debtsController = new DebtsController(debtRepository as DebtsMongooseRepository);

    it('Should throw a CustomError with status 400', async () => {
      const req: Partial<AuthRequest> = { userId: mockUserId, query: { mode: 'invalid' } };

      try {
        await debtsController.deleteAllPaidDebts(req as AuthRequest, res as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).statusCode).toBe(400);
        expect((error as CustomError).publicMessage).toBe('Mode must be creditor or debtor');
      }

      expect(debtRepository.deleteAllPaidDebts).not.toHaveBeenCalled();
    });
  });

  describe('When an unexpected error occurs', () => {
    const debtRepository: Pick<IDebtRepository, 'deleteAllPaidDebts'> = {
      deleteAllPaidDebts: jest.fn().mockRejectedValue(new Error('Unexpected error')),
    };
    const debtsController = new DebtsController(debtRepository as DebtsMongooseRepository);

    it('Should throw a CustomError with status 500', async () => {
      try {
        await debtsController.deleteAllPaidDebts(
          mockRequest('creditor') as AuthRequest,
          res as Response
        );
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).statusCode).toBe(500);
        expect((error as CustomError).publicMessage).toBe('Could not delete paid debts');
      }
    });
  });
});
