import { Response } from 'express';
import { AuthController } from '../AuthController';
import User from '../../../users/models/user';
import CustomError from '../../../../server/middlewares/errors/CustomError/CustomError';
import { mockAdminUser, mockUser } from '../../mocks/authMock';
import { AuthRequest } from '../../middlewares/authMiddleware';

jest.mock('../../../users/models/user');

describe('Given the method me in AuthController', () => {
  let authController: AuthController;
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    authController = new AuthController();

    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    jest.clearAllMocks();
  });

  describe('When user is authenticated with valid userId', () => {
    it('Should return 200 status code and user data without password', async () => {
      const expectedStatusCode = 200;
      mockRequest.userId = mockUser._id.toString();

      const userWithoutPassword = {
        _id: mockUser._id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        displayName: mockUser.displayName,
        email: mockUser.email,
        role: mockUser.role,
      };

      const mockSelect = jest.fn().mockResolvedValue(userWithoutPassword);
      (User.findById as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      await authController.me(mockRequest as AuthRequest, mockResponse as Response);

      expect(User.findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(mockSelect).toHaveBeenCalledWith('-password');
      expect(mockStatus).toHaveBeenCalledWith(expectedStatusCode);
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
    it('Should return 200 status code and admin user data', async () => {
      const expectedStatusCode = 200;
      mockRequest.userId = mockAdminUser._id.toString();

      const adminWithoutPassword = {
        _id: mockAdminUser._id,
        firstName: mockAdminUser.firstName,
        lastName: mockAdminUser.lastName,
        displayName: mockAdminUser.displayName,
        email: mockAdminUser.email,
        role: mockAdminUser.role,
      };

      const mockSelect = jest.fn().mockResolvedValue(adminWithoutPassword);
      (User.findById as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      await authController.me(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(expectedStatusCode);
      expect(mockJson).toHaveBeenCalledWith({
        _id: mockAdminUser._id.toString(),
        firstName: mockAdminUser.firstName,
        lastName: mockAdminUser.lastName,
        displayName: mockAdminUser.displayName,
        email: mockAdminUser.email,
        role: mockAdminUser.role,
      });
    });
  });

  describe('When userId is undefined', () => {
    it('Should throw a CustomError with 401 status code', async () => {
      const expectedStatusCode = 401;
      const expectedPublicMessage = 'Authentication required';
      mockRequest.userId = undefined;

      await expect(
        authController.me(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toThrow(CustomError);

      await expect(
        authController.me(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toMatchObject({
        statusCode: expectedStatusCode,
        publicMessage: expectedPublicMessage,
      });

      expect(User.findById).not.toHaveBeenCalled();
    });
  });

  describe('When userId is null', () => {
    it('Should throw CustomError with 401 status code', async () => {
      const expectedStatusCode = 401;
      mockRequest.userId = null as any;

      await expect(
        authController.me(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toThrow(CustomError);

      await expect(
        authController.me(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toMatchObject({
        statusCode: expectedStatusCode,
      });
    });
  });

  describe('When user is not found in database', () => {
    it('Should throw CustomError with 404 status code', async () => {
      const expectedStatusCode = 404;
      const expectedPublicMessage = 'User account not found';
      mockRequest.userId = mockUser._id.toString();

      const mockSelect = jest.fn().mockResolvedValue(null);
      (User.findById as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      await expect(
        authController.me(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toThrow(CustomError);

      await expect(
        authController.me(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toMatchObject({
        statusCode: expectedStatusCode,
        publicMessage: expectedPublicMessage,
      });

      expect(User.findById).toHaveBeenCalledWith(mockUser._id.toString());
      expect(mockSelect).toHaveBeenCalledWith('-password');
    });
  });

  describe('When database query fails', () => {
    it('Should throw CustomError with 500 status code', async () => {
      const expectedStatusCode = 500;
      mockRequest.userId = mockUser._id.toString();

      const mockSelect = jest.fn().mockRejectedValue(new Error('Database connection error'));
      (User.findById as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      await expect(
        authController.me(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toThrow(CustomError);

      await expect(
        authController.me(mockRequest as AuthRequest, mockResponse as Response)
      ).rejects.toMatchObject({
        statusCode: expectedStatusCode,
      });
    });
  });

  describe('When returned user data', () => {
    it('Should not include password field', async () => {
      mockRequest.userId = mockUser._id.toString();

      const userWithoutPassword = {
        _id: mockUser._id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        displayName: mockUser.displayName,
        email: mockUser.email,
        role: mockUser.role,
      };

      const mockSelect = jest.fn().mockResolvedValue(userWithoutPassword);
      (User.findById as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      await authController.me(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockSelect).toHaveBeenCalledWith('-password');
      expect(mockJson).toHaveBeenCalledWith(
        expect.not.objectContaining({ password: expect.anything() })
      );
    });

    it('Should convert _id to string format', async () => {
      mockRequest.userId = mockUser._id.toString();

      const userWithObjectId = {
        _id: mockUser._id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        displayName: mockUser.displayName,
        email: mockUser.email,
        role: mockUser.role,
      };

      const mockSelect = jest.fn().mockResolvedValue(userWithObjectId);
      (User.findById as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      await authController.me(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: mockUser._id.toString(),
        })
      );
      expect(typeof mockJson.mock.calls[0][0]._id).toBe('string');
    });

    it('Should include all required user fields', async () => {
      mockRequest.userId = mockUser._id.toString();

      const userWithoutPassword = {
        _id: mockUser._id,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        displayName: mockUser.displayName,
        email: mockUser.email,
        role: mockUser.role,
      };

      const mockSelect = jest.fn().mockResolvedValue(userWithoutPassword);
      (User.findById as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      await authController.me(mockRequest as AuthRequest, mockResponse as Response);

      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
          displayName: expect.any(String),
          email: expect.any(String),
          role: expect.any(String),
        })
      );
    });
  });
});
