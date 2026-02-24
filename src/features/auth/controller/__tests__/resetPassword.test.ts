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

describe('Given the resetPassword method in AuthController', () => {
  describe('When it receives a valid token and new password', () => {
    it('Should respond with status 200 and a success message', async () => {
      const req = { body: { token: 'valid-token', newPassword: 'NewPassword123!' } } as Request;
      const expectedMessage = { message: 'Password reset successfully.' };

      mockAuthService.resetPassword = jest.fn().mockResolvedValue(undefined);
      const authController = new AuthController(mockAuthService);

      await authController.resetPassword(req, res as Response);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith('valid-token', 'NewPassword123!');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expectedMessage);
    });
  });

  describe('When the token is invalid or expired', () => {
    it('Should throw a CustomError with status 400', async () => {
      const req = { body: { token: 'expired-token', newPassword: 'NewPassword123!' } } as Request;
      const expectedStatusCode = 400;
      const expectedPublicMessage = 'Invalid or expired reset token';

      const error = new CustomError(
        'Invalid or expired token',
        expectedStatusCode,
        expectedPublicMessage
      );

      mockAuthService.resetPassword = jest.fn().mockRejectedValue(error);
      const authController = new AuthController(mockAuthService);

      await expect(authController.resetPassword(req, res as Response)).rejects.toMatchObject({
        statusCode: expectedStatusCode,
        publicMessage: expectedPublicMessage,
      });
    });
  });

  describe('When an unexpected error occurs', () => {
    it('Should throw a CustomError with status 500', async () => {
      const req = { body: { token: 'valid-token', newPassword: 'NewPassword123!' } } as Request;
      const expectedStatusCode = 500;
      const expectedPublicMessage = 'Could not reset password';

      mockAuthService.resetPassword = jest.fn().mockRejectedValue(new Error('Unexpected error'));
      const authController = new AuthController(mockAuthService);

      await expect(authController.resetPassword(req, res as Response)).rejects.toMatchObject({
        statusCode: expectedStatusCode,
        publicMessage: expectedPublicMessage,
      });
    });
  });
});
