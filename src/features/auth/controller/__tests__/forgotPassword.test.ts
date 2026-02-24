import { Request, Response } from 'express';

import { AuthController } from '../AuthController';
import { AuthService } from '../../services/auth.service';
import CustomError from '../../../../server/middlewares/errors/CustomError/CustomError';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  getMe: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
} as unknown as AuthService;

const res: Pick<Response, 'status' | 'json'> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Given the forgotPassword method in AuthController', () => {
  describe('When it receives a valid email', () => {
    it('Should respond with status 200 and a generic success message', async () => {
      const req = { body: { email: 'test@email.dev' } } as Request;
      const expectedMessage = { message: 'If that email exists, a reset link has been sent.' };

      mockAuthService.forgotPassword = jest.fn().mockResolvedValue(undefined);
      const authController = new AuthController(mockAuthService);

      await authController.forgotPassword(req, res as Response);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('test@email.dev');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedMessage);
    });
  });

  describe('When the email does not exist', () => {
    it('Should still respond with status 200 to prevent email enumeration', async () => {
      const req = { body: { email: 'nonexistent@example.com' } } as Request;
      const expectedMessage = {
        message: 'If that email exists, a reset link has been sent.',
      };

      mockAuthService.forgotPassword = jest.fn().mockResolvedValue(undefined);
      const authController = new AuthController(mockAuthService);

      await authController.forgotPassword(req, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedMessage);
    });
  });

  describe('When an unexpected error occurs', () => {
    it('Should throw a CustomError with status 500', async () => {
      const req = { body: { email: 'test@email.dev' } } as Request;
      const expectedStatusCode = 500;
      const expectedPublicMessage = 'Could not process request';

      mockAuthService.forgotPassword = jest.fn().mockRejectedValue(new Error('Unexpected error'));
      const authController = new AuthController(mockAuthService);

      await expect(authController.forgotPassword(req, res as Response)).rejects.toMatchObject({
        statusCode: expectedStatusCode,
        publicMessage: expectedPublicMessage,
      });
    });
  });
});
