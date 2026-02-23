import { Response } from 'express';
import DebtsController from '../DebtsController';
import DebtsMongooseRepository from '../../repository/DebtsRepository';
import { DebtRequestWithoutId } from '../../types/requests';
import { debtsMock, mockCreateDebtPayload } from '../../mocks/debtsMock';
import { IDebtRepository } from '../../types/debt';
import CustomError from '../../../../server/middlewares/errors/CustomError/CustomError';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Given the method createDebt in DebtsController', () => {
  const res: Pick<Response, 'status' | 'json'> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  describe('When it receives a valid request to create a new debt', () => {
    const req: Pick<DebtRequestWithoutId, 'body'> = {
      body: mockCreateDebtPayload,
    };

    const debtsMockRepository: Pick<IDebtRepository, 'createDebt'> = {
      createDebt: jest.fn().mockResolvedValue(mockCreateDebtPayload),
    };

    const debtsController = new DebtsController(debtsMockRepository as DebtsMongooseRepository);

    test('Then it should call the response status method with a 201 code and the method json with the new debt on it and a message', async () => {
      const expectedStatusCode = 201;
      const expectedJson = {
        message: 'Debt succesfully created!',
        debt: mockCreateDebtPayload,
      };

      await debtsController.createDebt(req as DebtRequestWithoutId, res as Response);

      expect(debtsMockRepository.createDebt).toHaveBeenCalledWith(mockCreateDebtPayload);
      expect(res.status).toHaveBeenCalledWith(expectedStatusCode);
      expect(res.json).toHaveBeenCalledWith(expectedJson);
    });
  });

  describe('When there is an error with the request caused by the repository or a server fail', () => {
    const req: Partial<DebtRequestWithoutId> = {
      body: { amount: 0 },
    } as unknown as DebtRequestWithoutId;

    const debtsMockRepository: Pick<IDebtRepository, 'createDebt'> = {
      createDebt: jest.fn().mockRejectedValue(new Error('Database error')),
    };

    const debtsController = new DebtsController(debtsMockRepository as DebtsMongooseRepository);

    test('Then it should throw a CustomError with a message, publicMessage and statusCode', async () => {
      const errorMessage = 'Error creating debt';
      const publicErrorMessage = 'Could not create debt';
      const expectedStatusCode = 500;

      try {
        await debtsController.createDebt(req as DebtRequestWithoutId, res as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).message).toBe(errorMessage);
        expect((error as CustomError).publicMessage).toBe(publicErrorMessage);
        expect((error as CustomError).statusCode).toBe(expectedStatusCode);
      }
    });
  });
});
