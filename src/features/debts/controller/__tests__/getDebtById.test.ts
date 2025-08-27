import type { Request, Response } from 'express';
import { debtsMock } from '../../mocks/debtsMock';
import { Mongoose } from 'mongoose';
import { IDebtRepository } from '../../types/debt';
import DebtsController from '../DebtsController';
import DebtsMongooseRepository from '../../repository/DebtsMongooseRepository';
import { DebtRequestById } from '../../types/requests';
import CustomError from '../../../../server/middlewares/errors/CustomError/CustomError';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Given the method getDebtById in DebtsController', () => {
  const res: Pick<Response, 'status' | 'json'> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  describe('When it receives a request with a valid debtId as params', () => {
    const debtMock = debtsMock[0];
    const debtId = debtMock._id.toString();

    const req: Pick<Request, 'params'> = {
      params: { debtId },
    };

    const debtsMockRepository: Pick<IDebtRepository, 'getDebtById'> = {
      getDebtById: jest.fn().mockResolvedValue(debtMock),
    };

    const debtsController = new DebtsController(
      debtsMockRepository as DebtsMongooseRepository
    );

    test('Then it should call the response status method with a 200 code and the json method with the debt and a message', async () => {
      const expectedStatusCode = 200;
      const expectedJson = {
        message: 'Debt fetched succesfully!',
        debt: debtMock,
      };

      await debtsController.getDebtById(
        req as DebtRequestById,
        res as Response
      );

      expect(debtsMockRepository.getDebtById).toHaveBeenCalledWith(debtId);
      expect(res.status).toHaveBeenCalledWith(expectedStatusCode);
      expect(res.json).toHaveBeenCalledWith(expectedJson);
    });
  });
  describe('When it receives a request with a valid debtId as params but the resource does not exist', () => {
    const wrongDebtId = '64e52d9f1a2b3c4d5e6f7a99';

    const req: Pick<DebtRequestById, 'params'> = {
      params: { debtId: wrongDebtId },
    };

    const debtsMockRepository: Pick<IDebtRepository, 'getDebtById'> = {
      getDebtById: jest.fn().mockResolvedValue(null),
    };

    const debtsController = new DebtsController(
      debtsMockRepository as DebtsMongooseRepository
    );

    test('Then it should throw a CustomError with a message, publicMessage and statusCode', async () => {
      const errorMessage = 'Debt not found';
      const publicErrorMessage = 'Debt not found';
      const expectedStatusCode = 404;

      try {
        await debtsController.getDebtById(
          req as DebtRequestById,
          res as Response
        );
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).message).toBe(errorMessage);
        expect((error as CustomError).publicMessage).toBe(publicErrorMessage);
        expect((error as CustomError).statusCode).toBe(expectedStatusCode);
      }
    });
  });

  describe('When it receives a request with an invalid debtId as params', () => {
    const wrongDebtId = 'invalidId';
    const req: Pick<DebtRequestById, 'params'> = {
      params: { debtId: wrongDebtId },
    };

    const debtsMockRepository: Pick<IDebtRepository, 'getDebtById'> = {
      getDebtById: jest.fn().mockRejectedValue(new Error('Database Error')),
    };

    const debtsController = new DebtsController(
      debtsMockRepository as DebtsMongooseRepository
    );

    test('Then it should throw a CustomError with a message, publicMessage and statusCode', async () => {
      const errorMessage = 'Error fetching debt';
      const publicErrorMessage = 'Could not get debt';
      const expectedStatusCode = 500;

      try {
        await debtsController.getDebtById(
          req as DebtRequestById,
          res as Response
        );
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).message).toBe(errorMessage);
        expect((error as CustomError).publicMessage).toBe(publicErrorMessage);
        expect((error as CustomError).statusCode).toBe(expectedStatusCode);
      }
    });
  });
});
