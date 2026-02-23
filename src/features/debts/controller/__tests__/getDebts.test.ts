import type { Request, Response } from 'express';
import { IDebtRepository } from '../../types/debt';
import DebtsController from '../DebtsController';
import { debtsMock } from '../../mocks/debtsMock';
import CustomError from '../../../../server/middlewares/errors/CustomError/CustomError';
import DebtsMongooseRepository from '../../repository/DebtsRepository';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Given the method getDebts in DebtsController', () => {
  const debtsMockRepository: Pick<IDebtRepository, 'getDebts'> = {
    getDebts: jest.fn().mockResolvedValue(debtsMock),
  };
  const req = {};
  const res: Pick<Response, 'status' | 'json'> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  describe('When it is called with a response as a parameter', () => {
    const debtsController = new DebtsController(debtsMockRepository as DebtsMongooseRepository);

    test('Then it should call the response status method with a 200 code and the json method with the debts and a message', async () => {
      const expectedJson = {
        message: 'Debts fetched succesfully!',
        debts: debtsMock,
      };
      const expectedStatusCode = 200;

      await debtsController.getDebts(req as Request, res as Response);

      expect(debtsMockRepository.getDebts).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(expectedStatusCode);
      expect(res.json).toHaveBeenCalledWith(expectedJson);
    });
  });

  describe('When the repository fails', () => {
    test('Then it should throw a CustomError with a message, publicMessage and statusCode', async () => {
      debtsMockRepository.getDebts = jest.fn().mockRejectedValue(new Error('Database error'));

      const debtsController = new DebtsController(debtsMockRepository as DebtsMongooseRepository);

      const errorMessage = 'Error fetching debts';
      const publicErrorMessage = 'Could not get debts';
      const expectedCode = 500;

      try {
        await debtsController.getDebts(req as Request, res as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).message).toBe(errorMessage);
        expect((error as CustomError).publicMessage).toBe(publicErrorMessage);
        expect((error as CustomError).statusCode).toBe(expectedCode);
      }
    });
  });
});
