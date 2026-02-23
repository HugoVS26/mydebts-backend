import { Response } from 'express';
import { AuthController } from '../AuthController';
import CustomError from '../../../../server/middlewares/errors/CustomError/CustomError';
import { AuthService } from '../../services/auth.service';
import { mockUser, mockAdminUser } from '../../mocks/authMock';
import { AuthRequest } from '../../middlewares/authMiddleware';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  getMe: jest.fn(),
} as unknown as AuthService;

const mockJson = jest.fn();
const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

const mockResponse: Partial<Response> = {
  status: mockStatus,
  json: mockJson,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Given the me method in AuthController', () => {
  describe('When user is authenticated with a valid userId', () => {
    it('Should respond with status 200 and the user data', async () => {
      const mockRequest: Partial<AuthRequest> = { userId: mockUser._id.toString() };
      const userResponse = {
        _id: mockUser._id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        displayName: mockUser.displayName,
        email: mockUser.email,
        role: mockUser.role,
      };

      mockAuthService.getMe = jest.fn().mockResolvedValue(userResponse);
      const authController = new AuthController(mockAuthService);

      await authController.me(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockAuthService.getMe).toHaveBeenCalledWith(mockUser._id.toString());
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        _id: mockUser._id.toString(),
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        displayName: mockUser.displayName,
        email: mockUser.email,
        role: mockUser.role,
      });
    });
  });

  describe('When user is an admin', () => {
    it('Should respond with status 200 and the admin user data', async () => {
      const mockRequest: Partial<AuthRequest> = { userId: mockAdminUser._id.toString() };

      mockAuthService.getMe = jest.fn().mockResolvedValue(mockAdminUser);
      const authController = new AuthController(mockAuthService);

      await authController.me(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }));
    });
  });

  describe('When userId is missing', () => {
    it('Should throw a CustomError with status 401', async () => {
      const mockRequest: Partial<AuthRequest> = { userId: undefined };
      const authController = new AuthController(mockAuthService);

      await expect(
        authController.me(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toMatchObject({
        statusCode: 401,
        publicMessage: 'Authentication required',
      });

      expect(mockAuthService.getMe).not.toHaveBeenCalled();
    });
  });

  describe('When user is not found', () => {
    it('Should throw a CustomError with status 404', async () => {
      const mockRequest: Partial<AuthRequest> = { userId: mockUser._id.toString() };
      const error = new CustomError('User not found', 404, 'User account not found');

      mockAuthService.getMe = jest.fn().mockRejectedValue(error);
      const authController = new AuthController(mockAuthService);

      await expect(
        authController.me(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toMatchObject({
        statusCode: 404,
        publicMessage: 'User account not found',
      });
    });
  });

  describe('When an unexpected error occurs', () => {
    it('Should throw a CustomError with status 500', async () => {
      const mockRequest: Partial<AuthRequest> = { userId: mockUser._id.toString() };

      mockAuthService.getMe = jest.fn().mockRejectedValue(new Error('Unexpected error'));
      const authController = new AuthController(mockAuthService);

      await expect(
        authController.me(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toMatchObject({ statusCode: 500 });
    });
  });
});
