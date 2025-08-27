import { Response } from 'express';
import { DebtRequestById } from '../../types/requests';
import { updatedDebtMock } from '../../mocks/debtsMock';
import DebtsMongooseRepository from '../../repository/DebtsMongooseRepository';
import DebtsController from '../DebtsController';
import CustomError from '../../../../server/middlewares/errors/CustomError/CustomError';
import { IDebtRepository } from '../../types/debt';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Given the updateDebts method in DebtsController', () => {
  const res: Pick<Response, 'status' | 'json'> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  describe('When it receives a valid debtId in the request params and the debt in the body', () => {
    const updatedDebtIdMock = updatedDebtMock._id.toString();

    const req: Pick<DebtRequestById, 'body' | 'params'> = {
      body: updatedDebtMock,
      params: { debtId: updatedDebtIdMock },
    };

    const debtRepository: Pick<IDebtRepository, 'updateDebt'> = {
      updateDebt: jest.fn().mockResolvedValue(updatedDebtMock),
    };

    const debtController = new DebtsController(
      debtRepository as DebtsMongooseRepository
    );

    test('Then it should call response response status method with 200 code and json method with the updated debt and a message', async () => {
      const expectedStatusCode = 200;
      const expectedJson = {
        message: 'Debt succesfully updated!',
        debt: updatedDebtMock,
      };

      await debtController.updateDebt(req as DebtRequestById, res as Response);

      expect(debtRepository.updateDebt).toHaveBeenCalledWith(
        updatedDebtIdMock,
        updatedDebtMock
      );
      expect(res.status).toHaveBeenCalledWith(expectedStatusCode);
      expect(res.json).toHaveBeenCalledWith(expectedJson);
    });
  });

  describe('When it receives a request with a valid debtId in its params but the resource does not exist', () => {
    const wrongDebtId = '64e52d9f1a2b3c4d5e6f7a99';

    const req: Pick<DebtRequestById, 'body' | 'params'> = {
      body: updatedDebtMock,
      params: { debtId: wrongDebtId },
    };

    const debtRepository: Pick<DebtsMongooseRepository, 'updateDebt'> = {
      updateDebt: jest.fn().mockResolvedValue(null),
    };

    const debtsController = new DebtsController(
      debtRepository as DebtsMongooseRepository
    );

    test('Then it should throw a CustomError with a message, publicMessage and statusCode', async () => {
      const errorMessage = 'Debt not found';
      const publicErrorMessage = 'Debt not found';
      const expectedStatusCode = 404;

      try {
        await debtsController.updateDebt(
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
    const req: Pick<DebtRequestById, 'body' | 'params'> = {
      body: updatedDebtMock,
      params: { debtId: wrongDebtId },
    };

    const debtsMockRepository: Pick<IDebtRepository, 'updateDebt'> = {
      updateDebt: jest.fn().mockRejectedValue(wrongDebtId),
    };

    const debtsController = new DebtsController(
      debtsMockRepository as DebtsMongooseRepository
    );

    test('Then it should throw a CustomError with a message, publicMessage and statusCode', async () => {
      const errorMessage = 'Error updating debt';
      const publicErrorMessage = 'Could not update debt';
      const expectedStatusCode = 500;

      try {
        await debtsController.updateDebt(
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
