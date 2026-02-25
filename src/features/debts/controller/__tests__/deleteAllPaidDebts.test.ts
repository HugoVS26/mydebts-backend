import { Request, Response } from 'express';
import DebtsMongooseRepository from '../../repository/DebtsRepository';
import DebtsController from '../DebtsController';
import CustomError from '../../../../server/middlewares/errors/CustomError/CustomError';
import { IDebtRepository } from '../../types/debt';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Given the deleteAllPaidDebts method in DebtsController', () => {
  const res: Pick<Response, 'status' | 'json'> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  describe('When it receives a valid request', () => {
    const debtRepository: Pick<IDebtRepository, 'deleteAllPaidDebts'> = {
      deleteAllPaidDebts: jest.fn().mockResolvedValue(3),
    };
    const debtsController = new DebtsController(debtRepository as DebtsMongooseRepository);

    it('Should respond with status 200 and deleted count message', async () => {
      const expectedMessage = { message: '3 paid debt(s) successfully deleted.' };
      await debtsController.deleteAllPaidDebts({} as Request, res as Response);

      expect(debtRepository.deleteAllPaidDebts).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedMessage);
    });
  });

  describe('When no paid debts exist', () => {
    const expectedMessage = { message: '0 paid debt(s) successfully deleted.' };
    const debtRepository: Pick<IDebtRepository, 'deleteAllPaidDebts'> = {
      deleteAllPaidDebts: jest.fn().mockResolvedValue(0),
    };
    const debtsController = new DebtsController(debtRepository as DebtsMongooseRepository);

    it('Should respond with status 200 and zero deleted count', async () => {
      await debtsController.deleteAllPaidDebts({} as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedMessage);
    });
  });

  describe('When an unexpected error occurs', () => {
    const debtRepository: Pick<IDebtRepository, 'deleteAllPaidDebts'> = {
      deleteAllPaidDebts: jest.fn().mockRejectedValue(new Error('Unexpected error')),
    };
    const debtsController = new DebtsController(debtRepository as DebtsMongooseRepository);

    it('Should throw a CustomError with status 500', async () => {
      const expectedStatusCode = 500;
      const expectedPublicMessage = 'Could not delete paid debts';

      try {
        await debtsController.deleteAllPaidDebts({} as Request, res as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).statusCode).toBe(expectedStatusCode);
        expect((error as CustomError).publicMessage).toBe(expectedPublicMessage);
      }
    });
  });
});
