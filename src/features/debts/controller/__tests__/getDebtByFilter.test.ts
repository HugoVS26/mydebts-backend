import type { Response } from 'express';
import { IDebtRepository } from '../../types/debt';
import DebtsController from '../DebtsController';
import { debtsMock } from '../../mocks/debtsMock';
import CustomError from '../../../../server/middlewares/errors/CustomError/CustomError';
import { DebtRequestByFilter } from '../../types/requests';
import DebtsMongooseRepository from '../../repository/DebtsMongooseRepository';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Given the method getDebtByFilter in DebtsController', () => {
  const debtsMockRepository: Pick<IDebtRepository, 'getDebtsByFilter'> = {
    getDebtsByFilter: jest.fn().mockResolvedValue(debtsMock),
  };

  const debtsController = new DebtsController(debtsMockRepository as DebtsMongooseRepository);

  const res: Pick<Response, 'status' | 'json'> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  describe('When it receives a valid filter as query params', () => {
    const filterCondition = { status: 'unpaid' };
    const req = { query: filterCondition } as unknown as DebtRequestByFilter;

    test('Then it should call the response status method with a 200 code and the json method with the filtered debt and a message', async () => {
      const expectedStatusCode = 200;
      const expectedJson = {
        message: 'Filtered debts fetched succesfully!',
        debts: debtsMock,
      };

      await debtsController.getDebtsByFilter(req, res as Response);

      expect(debtsMockRepository.getDebtsByFilter).toHaveBeenCalledWith(filterCondition);
      expect(res.status).toHaveBeenCalledWith(expectedStatusCode);
      expect(res.json).toHaveBeenCalledWith(expectedJson);
    });
  });

  describe('When it is called without query params', () => {
    const filterCondition = {};
    const req = { query: filterCondition } as DebtRequestByFilter;

    test('Then it should call response status with a 200 code and a response with the unfiltered debts', async () => {
      const expectedStatusCode = 200;
      const expectedJson = {
        message: 'Filtered debts fetched succesfully!',
        debts: debtsMock,
      };

      await debtsController.getDebtsByFilter(req, res as Response);

      expect(debtsMockRepository.getDebtsByFilter).toHaveBeenCalledWith(filterCondition);
      expect(res.status).toHaveBeenCalledWith(expectedStatusCode);
      expect(res.json).toHaveBeenCalledWith(expectedJson);
    });
  });

  describe('When it is called with an invalid filter as query params', () => {
    const wrongFilterCondition = { creditor: 123 };
    const req = {
      query: wrongFilterCondition,
    } as unknown as DebtRequestByFilter;

    test('Then it should throw a CustomError with a message, publicMessage and statusCode', async () => {
      const errorMessage = 'Error filtering debts';
      const publicErrorMessage = 'Could not filter debts';
      const expectedStatusCode = 500;

      debtsMockRepository.getDebtsByFilter = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      try {
        await debtsController.getDebtsByFilter(req, res as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).message).toBe(errorMessage);
        expect((error as CustomError).publicMessage).toBe(publicErrorMessage);
        expect((error as CustomError).statusCode).toBe(expectedStatusCode);
      }
    });
  });
});
