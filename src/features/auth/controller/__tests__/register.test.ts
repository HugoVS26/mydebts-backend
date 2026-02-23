import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { AuthController } from '../AuthController';
import { AuthService } from '../../services/auth.service';
import CustomError from '../../../../server/middlewares/errors/CustomError/CustomError';
import { RegisterRequest } from '../../types/requests';
import { mockRegisterPayload, mockAuthResponse } from '../../mocks/authMock';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  getMe: jest.fn(),
} as unknown as AuthService;

const res: Pick<Response, 'status' | 'json'> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Given the register method in AuthController', () => {
  describe('When it receives a valid request to register a new user', () => {
    it('Should respond with status 201 and the auth response', async () => {
      const req = { body: mockRegisterPayload } as Request<{}, {}, RegisterRequest>;

      mockAuthService.register = jest.fn().mockResolvedValue(mockAuthResponse);
      const authController = new AuthController(mockAuthService);

      await authController.register(req, res as Response);

      expect(mockAuthService.register).toHaveBeenCalledWith(
        mockRegisterPayload.firstName,
        mockRegisterPayload.lastName,
        mockRegisterPayload.email,
        mockRegisterPayload.password
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockAuthResponse);
    });
  });

  describe('When the email is already registered', () => {
    it('Should throw a CustomError with status 409', async () => {
      const req = { body: mockRegisterPayload } as Request<{}, {}, RegisterRequest>;
      const error = new CustomError('Email already registered', 409, 'Email already in use');

      mockAuthService.register = jest.fn().mockRejectedValue(error);
      const authController = new AuthController(mockAuthService);

      await expect(authController.register(req, res as Response)).rejects.toMatchObject({
        statusCode: 409,
        publicMessage: 'Email already in use',
      });
    });
  });

  describe('When a mongoose ValidationError is thrown', () => {
    it('Should rethrow the ValidationError', async () => {
      const req = { body: mockRegisterPayload } as Request<{}, {}, RegisterRequest>;
      const validationError = new mongoose.Error.ValidationError();

      mockAuthService.register = jest.fn().mockRejectedValue(validationError);
      const authController = new AuthController(mockAuthService);

      await expect(authController.register(req, res as Response)).rejects.toBeInstanceOf(
        mongoose.Error.ValidationError
      );
    });
  });

  describe('When an unexpected error occurs', () => {
    it('Should throw a CustomError with status 500', async () => {
      const req = { body: mockRegisterPayload } as Request<{}, {}, RegisterRequest>;

      mockAuthService.register = jest.fn().mockRejectedValue(new Error('Unexpected error'));
      const authController = new AuthController(mockAuthService);

      await expect(authController.register(req, res as Response)).rejects.toMatchObject({
        statusCode: 500,
        publicMessage: 'Could not create user account',
      });
    });
  });
});
