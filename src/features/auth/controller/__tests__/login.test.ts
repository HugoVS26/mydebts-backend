import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { AuthController } from '../AuthController';
import User from '../../../users/models/user';
import CustomError from '../../../../server/middlewares/errors/CustomError/CustomError';
import { LoginRequest } from '../../types/requests';
import {
  mockUser,
  mockLoginPayload,
  mockLoginPayloadWrongPassword,
  mockLoginPayloadNonExistent,
  mockJwtToken,
  mockAuthResponse,
} from '../../mocks/authMock';

jest.mock('../../../users/models/user');
jest.mock('jsonwebtoken');

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = 'test-secret-key';
  mockUser.comparePassword = jest.fn();
});

describe('Given the method login in AuthController', () => {
  const res: Pick<Response, 'status' | 'json'> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  describe('When it receives a valid request to login with correct credentials', () => {
    const req: Pick<Request<{}, {}, LoginRequest>, 'body'> = {
      body: mockLoginPayload,
    };

    const authController = new AuthController();

    test('Then it should call the response status method with a 200 code and the method json with the token and user data', async () => {
      const expectedStatusCode = 200;

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      mockUser.comparePassword.mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockJwtToken);

      await authController.login(req as Request<{}, {}, LoginRequest>, res as Response);

      expect(User.findOne).toHaveBeenCalledWith({ email: mockLoginPayload.email });
      expect(mockUser.comparePassword).toHaveBeenCalledWith(mockLoginPayload.password);
      expect(res.status).toHaveBeenCalledWith(expectedStatusCode);
      expect(res.json).toHaveBeenCalledWith(mockAuthResponse);
    });
  });

  describe('When the user does not exist in the database', () => {
    const req: Pick<Request<{}, {}, LoginRequest>, 'body'> = {
      body: mockLoginPayloadNonExistent,
    };

    const authController = new AuthController();

    test('Then it should throw a CustomError with a message, publicMessage and statusCode 401', async () => {
      const errorMessage = 'Invalid credentials';
      const publicErrorMessage = 'Invalid email or password';
      const expectedStatusCode = 401;

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      try {
        await authController.login(req as Request<{}, {}, LoginRequest>, res as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).message).toBe(errorMessage);
        expect((error as CustomError).publicMessage).toBe(publicErrorMessage);
        expect((error as CustomError).statusCode).toBe(expectedStatusCode);
      }

      expect(mockUser.comparePassword).not.toHaveBeenCalled();
    });
  });

  describe('When the password is incorrect', () => {
    const req: Pick<Request<{}, {}, LoginRequest>, 'body'> = {
      body: mockLoginPayloadWrongPassword,
    };

    const authController = new AuthController();

    test('Then it should throw a CustomError with a message, publicMessage and statusCode 401', async () => {
      const errorMessage = 'Invalid credentials';
      const publicErrorMessage = 'Invalid email or password';
      const expectedStatusCode = 401;

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      mockUser.comparePassword.mockResolvedValue(false);

      try {
        await authController.login(req as Request<{}, {}, LoginRequest>, res as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).message).toBe(errorMessage);
        expect((error as CustomError).publicMessage).toBe(publicErrorMessage);
        expect((error as CustomError).statusCode).toBe(expectedStatusCode);
      }

      expect(mockUser.comparePassword).toHaveBeenCalledWith(mockLoginPayloadWrongPassword.password);
    });
  });

  describe('When querying the user from database', () => {
    const req: Pick<Request<{}, {}, LoginRequest>, 'body'> = {
      body: mockLoginPayload,
    };

    const authController = new AuthController();

    test('Then it should call select with "+password" to include password field', async () => {
      const mockSelect = jest.fn().mockResolvedValue(mockUser);

      (User.findOne as jest.Mock).mockReturnValue({
        select: mockSelect,
      });
      mockUser.comparePassword.mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockJwtToken);

      await authController.login(req as Request<{}, {}, LoginRequest>, res as Response);

      expect(mockSelect).toHaveBeenCalledWith('+password');
    });
  });

  describe('When there is a mongoose ValidationError', () => {
    const req: Pick<Request<{}, {}, LoginRequest>, 'body'> = {
      body: mockLoginPayload,
    };

    const authController = new AuthController();

    test('Then it should pass through the ValidationError', async () => {
      const validationError = new mongoose.Error.ValidationError();

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockRejectedValue(validationError),
      });

      try {
        await authController.login(req as Request<{}, {}, LoginRequest>, res as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      }
    });
  });

  describe('When there is an unexpected error during login', () => {
    const req: Pick<Request<{}, {}, LoginRequest>, 'body'> = {
      body: mockLoginPayload,
    };

    const authController = new AuthController();

    test('Then it should throw a CustomError with a message, publicMessage and statusCode 401', async () => {
      const errorMessage = 'Error logging in';
      const publicErrorMessage = 'Could not authenticate user';
      const expectedStatusCode = 401;

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database connection failed')),
      });

      try {
        await authController.login(req as Request<{}, {}, LoginRequest>, res as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).message).toBe(errorMessage);
        expect((error as CustomError).publicMessage).toBe(publicErrorMessage);
        expect((error as CustomError).statusCode).toBe(expectedStatusCode);
      }
    });
  });

  describe('When generating JWT token after successful login', () => {
    const req: Pick<Request<{}, {}, LoginRequest>, 'body'> = {
      body: mockLoginPayload,
    };

    const authController = new AuthController();

    test('Then it should sign JWT with correct payload and expiration', async () => {
      const expectedPayload = {
        userId: mockUser._id.toString(),
        email: mockUser.email,
        role: mockUser.role,
      };
      const expectedExpiration = '7d';

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      mockUser.comparePassword.mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(mockJwtToken);

      await authController.login(req as Request<{}, {}, LoginRequest>, res as Response);

      expect(jwt.sign).toHaveBeenCalledWith(expectedPayload, 'test-secret-key', {
        expiresIn: expectedExpiration,
      });
    });
  });

  describe('When JWT_SECRET is not configured in environment variables', () => {
    const req: Pick<Request<{}, {}, LoginRequest>, 'body'> = {
      body: mockLoginPayload,
    };

    const authController = new AuthController();

    test('Then it should throw a CustomError with a message, publicMessage and statusCode 401', async () => {
      const errorMessage = 'Error logging in';
      const publicErrorMessage = 'Could not authenticate user';
      const expectedStatusCode = 401;

      delete process.env.JWT_SECRET;
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      mockUser.comparePassword.mockResolvedValue(true);

      try {
        await authController.login(req as Request<{}, {}, LoginRequest>, res as Response);
      } catch (error) {
        expect(error).toBeInstanceOf(CustomError);
        expect((error as CustomError).message).toBe(errorMessage);
        expect((error as CustomError).publicMessage).toBe(publicErrorMessage);
        expect((error as CustomError).statusCode).toBe(expectedStatusCode);
      }

      process.env.JWT_SECRET = 'test-secret-key';
    });
  });
});
