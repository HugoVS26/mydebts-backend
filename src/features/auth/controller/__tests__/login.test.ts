import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { AuthController } from '../AuthController';
import { AuthService } from '../../services/auth.service';
import CustomError from '../../../../server/middlewares/errors/CustomError/CustomError';
import { LoginRequest } from '../../types/requests';
import {
  mockLoginPayload,
  mockLoginPayloadWrongPassword,
  mockLoginPayloadNonExistent,
  mockAuthResponse,
} from '../../mocks/authMock';

jest.mock('../../services/auth.service');

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  getMe: jest.fn(),
} as unknown as AuthService;

const res: Pick<Response, 'status' | 'json'> = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Given the login method in AuthController', () => {
  describe('When it receives a valid request with correct credentials', () => {
    it('Should respond with status 200 and the auth response', async () => {
      const req = { body: mockLoginPayload } as Request<{}, {}, LoginRequest>;

      mockAuthService.login = jest.fn().mockResolvedValue(mockAuthResponse);
      const authController = new AuthController(mockAuthService);

      await authController.login(req, res as Response);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        mockLoginPayload.email,
        mockLoginPayload.password
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockAuthResponse);
    });
  });

  describe('When the user does not exist', () => {
    it('Should throw a CustomError with status 401', async () => {
      const req = { body: mockLoginPayloadNonExistent } as Request<{}, {}, LoginRequest>;
      const error = new CustomError('Invalid credentials', 401, 'Invalid email or password');

      mockAuthService.login = jest.fn().mockRejectedValue(error);
      const authController = new AuthController(mockAuthService);

      try {
        await authController.login(req, res as Response);
      } catch (err) {
        expect(err).toBeInstanceOf(CustomError);
        expect((err as CustomError).message).toBe('Invalid credentials');
        expect((err as CustomError).publicMessage).toBe('Invalid email or password');
        expect((err as CustomError).statusCode).toBe(401);
      }
    });
  });

  describe('When the password is incorrect', () => {
    it('Should throw a CustomError with status 401', async () => {
      const req = { body: mockLoginPayloadWrongPassword } as Request<{}, {}, LoginRequest>;
      const error = new CustomError('Invalid credentials', 401, 'Invalid email or password');

      mockAuthService.login = jest.fn().mockRejectedValue(error);
      const authController = new AuthController(mockAuthService);

      try {
        await authController.login(req, res as Response);
      } catch (err) {
        expect(err).toBeInstanceOf(CustomError);
        expect((err as CustomError).message).toBe('Invalid credentials');
        expect((err as CustomError).publicMessage).toBe('Invalid email or password');
        expect((err as CustomError).statusCode).toBe(401);
      }
    });
  });

  describe('When a mongoose ValidationError is thrown', () => {
    it('Should rethrow the ValidationError', async () => {
      const req = { body: mockLoginPayload } as Request<{}, {}, LoginRequest>;
      const validationError = new mongoose.Error.ValidationError();

      mockAuthService.login = jest.fn().mockRejectedValue(validationError);
      const authController = new AuthController(mockAuthService);

      try {
        await authController.login(req, res as Response);
      } catch (err) {
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      }
    });
  });

  describe('When an unexpected error occurs', () => {
    it('Should throw a CustomError with status 401', async () => {
      const req = { body: mockLoginPayload } as Request<{}, {}, LoginRequest>;

      mockAuthService.login = jest.fn().mockRejectedValue(new Error('Unexpected error'));
      const authController = new AuthController(mockAuthService);

      try {
        await authController.login(req, res as Response);
      } catch (err) {
        expect(err).toBeInstanceOf(CustomError);
        expect((err as CustomError).message).toBe('Error logging in');
        expect((err as CustomError).publicMessage).toBe('Could not authenticate user');
        expect((err as CustomError).statusCode).toBe(401);
      }
    });
  });
});
