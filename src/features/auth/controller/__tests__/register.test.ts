import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { AuthController } from '../AuthController';
import User from '../../../users/models/user';
import CustomError from '../../../../server/middlewares/errors/CustomError/CustomError';
import { RegisterRequest } from '../../types/requests';
import {
  mockUser,
  mockRegisterPayload,
  mockJwtToken,
  mockAuthResponse,
} from '../../mocks/authMock';

jest.mock('../../../users/models/user');
jest.mock('jsonwebtoken');

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret-key';
});

describe('Given the method register in AuthController', () => {
  const res: Pick<Response, 'status' | 'json'> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  describe('When it receives a valid request to register a new user', () => {
    const req: Pick<Request<{}, {}, RegisterRequest>, 'body'> = {
      body: mockRegisterPayload,
    };

    const authController = new AuthController();

    test('Then it should call the response status method with a 201 code and the method json with the token and user data', async () => {
      const expectedStatusCode = 201;

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue(mockJwtToken);

      await authController.register(req as Request<{}, {}, RegisterRequest>, res as Response);

      expect(User.findOne).toHaveBeenCalledWith({ email: mockRegisterPayload.email });
      expect(User.create).toHaveBeenCalledWith(mockRegisterPayload);
      expect(res.status).toHaveBeenCalledWith(expectedStatusCode);
      expect(res.json).toHaveBeenCalledWith(mockAuthResponse);
    });
  });

  describe('When the email already exists in the database', () => {
    const req: Pick<Request<{}, {}, RegisterRequest>, 'body'> = {
      body: mockRegisterPayload,
    };

    const authController = new AuthController();

    test('Then it should throw a CustomError with a message, publicMessage and statusCode 409', async () => {
      const errorMessage = 'Email already registered';
      const publicErrorMessage = 'Email already in use';
      const expectedStatusCode = 409;

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      try {
        await authController.register(req as Request<{}, {}, RegisterRequest>, res as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).message).toBe(errorMessage);
        expect((error as CustomError).publicMessage).toBe(publicErrorMessage);
        expect((error as CustomError).statusCode).toBe(expectedStatusCode);
      }

      expect(User.create).not.toHaveBeenCalled();
    });
  });

  describe('When JWT_SECRET is not configured in environment variables', () => {
    const req: Pick<Request<{}, {}, RegisterRequest>, 'body'> = {
      body: mockRegisterPayload,
    };

    const authController = new AuthController();

    test('Then it should throw a CustomError with a message, publicMessage and statusCode 500', async () => {
      const errorMessage = 'Error registering user';
      const publicErrorMessage = 'Could not create user account';
      const expectedStatusCode = 500;

      delete process.env.JWT_SECRET;
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      try {
        await authController.register(req as Request<{}, {}, RegisterRequest>, res as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).message).toBe(errorMessage);
        expect((error as CustomError).publicMessage).toBe(publicErrorMessage);
        expect((error as CustomError).statusCode).toBe(expectedStatusCode);
      }

      process.env.JWT_SECRET = 'test-secret-key';
    });
  });

  describe('When there is a mongoose ValidationError', () => {
    const req: Pick<Request<{}, {}, RegisterRequest>, 'body'> = {
      body: mockRegisterPayload,
    };

    const authController = new AuthController();

    test('Then it should pass through the ValidationError', async () => {
      const validationError = new mongoose.Error.ValidationError();
      validationError.errors = {
        email: {
          message: 'Email is invalid',
        } as any,
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockRejectedValue(validationError);

      try {
        await authController.register(req as Request<{}, {}, RegisterRequest>, res as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      }
    });
  });

  describe('When there is an unexpected error during registration', () => {
    const req: Pick<Request<{}, {}, RegisterRequest>, 'body'> = {
      body: mockRegisterPayload,
    };

    const authController = new AuthController();

    test('Then it should throw a CustomError with a message, publicMessage and statusCode 500', async () => {
      const errorMessage = 'Error registering user';
      const publicErrorMessage = 'Could not create user account';
      const expectedStatusCode = 500;

      (User.findOne as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      try {
        await authController.register(req as Request<{}, {}, RegisterRequest>, res as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).message).toBe(errorMessage);
        expect((error as CustomError).publicMessage).toBe(publicErrorMessage);
        expect((error as CustomError).statusCode).toBe(expectedStatusCode);
      }
    });
  });

  describe('When generating JWT token', () => {
    const req: Pick<Request<{}, {}, RegisterRequest>, 'body'> = {
      body: mockRegisterPayload,
    };

    const authController = new AuthController();

    test('Then it should sign JWT with correct payload and expiration', async () => {
      const expectedPayload = {
        userId: mockUser._id.toString(),
        email: mockUser.email,
        role: mockUser.role,
      };
      const expectedExpiration = '7d';

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue(mockJwtToken);

      await authController.register(req as Request<{}, {}, RegisterRequest>, res as Response);

      expect(jwt.sign).toHaveBeenCalledWith(expectedPayload, 'test-secret-key', {
        expiresIn: expectedExpiration,
      });
    });
  });
});
