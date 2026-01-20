import request from 'supertest';
import express, { Application } from 'express';
import createAuthRouter from '../authRouter';
import { AuthController } from '../../controller/AuthController';
import User from '../../../users/models/user';
import {
  mockUser,
  mockRegisterPayload,
  mockLoginPayload,
  mockJwtToken,
  mockAuthResponse,
} from '../../mocks/authMock';

jest.mock('../../../users/models/user');
jest.mock('jsonwebtoken');

describe('Given the authRouter', () => {
  let app: Application;
  let authController: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key';

    app = express();
    app.use(express.json());

    authController = new AuthController();
    const authRouter = createAuthRouter(authController);

    app.use('/auth', authRouter);
  });

  describe('When POST /auth/register endpoint is called with valid data', () => {
    test('Then it should return 201 status and auth response with token', async () => {
      const expectedStatusCode = 201;

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      const jwt = require('jsonwebtoken');
      jwt.sign = jest.fn().mockReturnValue(mockJwtToken);

      const response = await request(app).post('/auth/register').send(mockRegisterPayload);

      expect(response.status).toBe(expectedStatusCode);
      expect(response.body).toEqual(mockAuthResponse);
    });
  });

  describe('When POST /auth/register endpoint is called with missing firstName', () => {
    test('Then it should return 400 status with validation error', async () => {
      const expectedStatusCode = 400;
      const invalidPayload = {
        lastName: 'García',
        email: 'hugo@example.com',
        password: 'SecurePass123!',
      };

      const response = await request(app).post('/auth/register').send(invalidPayload);

      expect(response.status).toBe(expectedStatusCode);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'firstName',
          }),
        ])
      );
    });
  });

  describe('When POST /auth/register endpoint is called with invalid email format', () => {
    test('Then it should return 400 status with validation error', async () => {
      const expectedStatusCode = 400;
      const invalidPayload = {
        firstName: 'Hugo',
        lastName: 'García',
        email: 'invalid-email',
        password: 'SecurePass123!',
      };

      const response = await request(app).post('/auth/register').send(invalidPayload);

      expect(response.status).toBe(expectedStatusCode);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
          }),
        ])
      );
    });
  });

  describe('When POST /auth/register endpoint is called with password too short', () => {
    test('Then it should return 400 status with validation error', async () => {
      const expectedStatusCode = 400;
      const invalidPayload = {
        firstName: 'Hugo',
        lastName: 'García',
        email: 'hugo@example.com',
        password: '123',
      };

      const response = await request(app).post('/auth/register').send(invalidPayload);

      expect(response.status).toBe(expectedStatusCode);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
          }),
        ])
      );
    });
  });

  describe('When POST /auth/login endpoint is called with valid credentials', () => {
    test('Then it should return 200 status and auth response with token', async () => {
      const expectedStatusCode = 200;

      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue({
          ...mockUser,
          comparePassword: jest.fn().mockResolvedValue(true),
        }),
      });
      const jwt = require('jsonwebtoken');
      jwt.sign = jest.fn().mockReturnValue(mockJwtToken);

      const response = await request(app).post('/auth/login').send(mockLoginPayload);

      expect(response.status).toBe(expectedStatusCode);
      expect(response.body).toEqual(mockAuthResponse);
    });
  });

  describe('When POST /auth/login endpoint is called with missing email', () => {
    test('Then it should return 400 status with validation error', async () => {
      const expectedStatusCode = 400;
      const invalidPayload = {
        password: 'SecurePass123!',
      };

      const response = await request(app).post('/auth/login').send(invalidPayload);

      expect(response.status).toBe(expectedStatusCode);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
          }),
        ])
      );
    });
  });

  describe('When POST /auth/login endpoint is called with missing password', () => {
    test('Then it should return 400 status with validation error', async () => {
      const expectedStatusCode = 400;
      const invalidPayload = {
        email: 'hugo@example.com',
      };

      const response = await request(app).post('/auth/login').send(invalidPayload);

      expect(response.status).toBe(expectedStatusCode);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
          }),
        ])
      );
    });
  });

  describe('When POST /auth/register endpoint is called with multiple validation errors', () => {
    test('Then it should return 400 status with all validation errors', async () => {
      const expectedStatusCode = 400;
      const invalidPayload = {
        firstName: '',
        email: 'invalid',
        password: '123',
      };

      const response = await request(app).post('/auth/register').send(invalidPayload);

      expect(response.status).toBe(expectedStatusCode);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('When POST /auth/login endpoint is called with invalid email format', () => {
    test('Then it should return 400 status with validation error', async () => {
      const expectedStatusCode = 400;
      const invalidPayload = {
        email: 'not-an-email',
        password: 'SecurePass123!',
      };

      const response = await request(app).post('/auth/login').send(invalidPayload);

      expect(response.status).toBe(expectedStatusCode);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
          }),
        ])
      );
    });
  });

  describe('When POST to an invalid route', () => {
    test('Then it should return 404 status', async () => {
      const expectedStatusCode = 404;

      const response = await request(app).post('/auth/invalid-route');

      expect(response.status).toBe(expectedStatusCode);
    });
  });
});
