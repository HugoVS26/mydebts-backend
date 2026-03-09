import { Response } from 'express';
import { AuthRequest } from '../../../auth/middlewares/authMiddleware.js';
import { SharedDebtLinksController } from '../SharedDebtLinksController.js';
import { SharedDebtLinksService } from '../../services/shared-debt-links.service.js';
import CustomError from '../../../../server/middlewares/errors/CustomError/CustomError.js';

const mockSharedDebtLinksService = {
  createShareLink: jest.fn(),
  getByToken: jest.fn(),
} as unknown as SharedDebtLinksService;

const res: Pick<Response, 'status' | 'json'> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Given the getByToken method in SharedDebtLinksController', () => {
  describe('When it receives a valid token', () => {
    test('Should respond with status 200 and the debt snapshot', async () => {
      const req = { params: { token: 'valid-token-123' } } as unknown as AuthRequest;
      const expectedDebt = { _id: 'debt-123', amount: 100, description: 'Test debt' };
      const expectedStatusCode = 200;

      mockSharedDebtLinksService.getByToken = jest.fn().mockResolvedValue(expectedDebt);
      const controller = new SharedDebtLinksController(mockSharedDebtLinksService);

      await controller.getByToken(req, res as Response);

      expect(mockSharedDebtLinksService.getByToken).toHaveBeenCalledWith('valid-token-123');
      expect(res.status).toHaveBeenCalledWith(expectedStatusCode);
      expect(res.json).toHaveBeenCalledWith(expectedDebt);
    });
  });

  describe('When the token does not exist or is expired', () => {
    test('Should throw a CustomError with status 404', async () => {
      const req = { params: { token: 'expired-token' } } as unknown as AuthRequest;
      const expectedStatusCode = 404;
      const expectedMessage = 'Link not found or expired';

      mockSharedDebtLinksService.getByToken = jest
        .fn()
        .mockRejectedValue(
          new CustomError('Link not found or expired', 404, 'Link not found or expired')
        );
      const controller = new SharedDebtLinksController(mockSharedDebtLinksService);

      await expect(controller.getByToken(req, res as Response)).rejects.toMatchObject({
        statusCode: expectedStatusCode,
        publicMessage: expectedMessage,
      });
    });
  });

  describe('When an unexpected error occurs', () => {
    test('Should throw a CustomError with status 500', async () => {
      const req = { params: { token: 'valid-token-123' } } as unknown as AuthRequest;
      const expectedStatusCode = 500;
      const expectedMessage = 'Could not process request';

      mockSharedDebtLinksService.getByToken = jest
        .fn()
        .mockRejectedValue(new Error('Unexpected error'));
      const controller = new SharedDebtLinksController(mockSharedDebtLinksService);

      await expect(controller.getByToken(req, res as Response)).rejects.toMatchObject({
        statusCode: expectedStatusCode,
        publicMessage: expectedMessage,
      });
    });
  });
});
