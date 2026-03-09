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

describe('Given the createShareLink method in SharedDebtLinksController', () => {
  describe('When it receives a valid debt id and authenticated user', () => {
    test('Should respond with status 201 and the generated token', async () => {
      const req = { params: { id: 'debt-123' }, userId: 'user-123' } as unknown as AuthRequest;
      const expectedToken = 'abc123token';
      const expectedStatusCode = 201;

      mockSharedDebtLinksService.createShareLink = jest.fn().mockResolvedValue(expectedToken);
      const controller = new SharedDebtLinksController(mockSharedDebtLinksService);

      await controller.createShareLink(req, res as Response);

      expect(mockSharedDebtLinksService.createShareLink).toHaveBeenCalledWith(
        'debt-123',
        'user-123'
      );
      expect(res.status).toHaveBeenCalledWith(expectedStatusCode);
      expect(res.json).toHaveBeenCalledWith({ token: expectedToken });
    });
  });

  describe('When the debt does not exist', () => {
    test('Should throw a CustomError with status 404', async () => {
      const req = {
        params: { id: 'nonexistent-id' },
        userId: 'user-123',
      } as unknown as AuthRequest;
      const expectedStatusCode = 404;
      const expectedMessage = 'Debt not found';

      mockSharedDebtLinksService.createShareLink = jest
        .fn()
        .mockRejectedValue(new CustomError('Debt not found', 404, 'Debt not found'));
      const controller = new SharedDebtLinksController(mockSharedDebtLinksService);

      await expect(controller.createShareLink(req, res as Response)).rejects.toMatchObject({
        statusCode: expectedStatusCode,
        publicMessage: expectedMessage,
      });
    });
  });

  describe('When an unexpected error occurs', () => {
    test('Should throw a CustomError with status 500', async () => {
      const req = { params: { id: 'debt-123' }, userId: 'user-123' } as unknown as AuthRequest;
      const expectedStatusCode = 500;
      const expectedMessage = 'Could not process request';

      mockSharedDebtLinksService.createShareLink = jest
        .fn()
        .mockRejectedValue(new Error('Unexpected error'));
      const controller = new SharedDebtLinksController(mockSharedDebtLinksService);

      await expect(controller.createShareLink(req, res as Response)).rejects.toMatchObject({
        statusCode: expectedStatusCode,
        publicMessage: expectedMessage,
      });
    });
  });
});
