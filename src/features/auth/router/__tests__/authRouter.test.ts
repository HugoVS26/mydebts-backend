import request from 'supertest';
import express, { Application } from 'express';
import createAuthRouter from '../authRouter';
import { AuthController } from '../../controller/AuthController';
import { AuthService } from '../../services/auth.service';
import {
  mockUser,
  mockRegisterPayload,
  mockLoginPayload,
  mockJwtToken,
  mockAuthResponse,
  mockJwtPayload,
} from '../../mocks/authMock';

jest.mock('../../services/auth.service');
jest.mock('../../middlewares/authMiddleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }
    req.userId = mockJwtPayload.userId;
    next();
  },
}));

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  getMe: jest.fn(),
} as unknown as AuthService;

describe('Given the authRouter', () => {
  let app: Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());

    const authController = new AuthController(mockAuthService);
    app.use('/auth', createAuthRouter(authController));
  });

  describe('When POST /auth/register is called with valid data', () => {
    it('Should return 201 and the auth response', async () => {
      mockAuthService.register = jest.fn().mockResolvedValue(mockAuthResponse);

      const response = await request(app).post('/auth/register').send(mockRegisterPayload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockAuthResponse);
    });
  });

  describe('When POST /auth/register is called with missing firstName', () => {
    it('Should return 400 with validation error', async () => {
      const response = await request(app).post('/auth/register').send({
        lastName: 'García',
        email: 'hugo@example.com',
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'firstName' })])
      );
    });
  });

  describe('When POST /auth/register is called with invalid email', () => {
    it('Should return 400 with validation error', async () => {
      const response = await request(app).post('/auth/register').send({
        firstName: 'Hugo',
        lastName: 'García',
        email: 'invalid-email',
        password: 'SecurePass123!',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'email' })])
      );
    });
  });

  describe('When POST /auth/register is called with password too short', () => {
    it('Should return 400 with validation error', async () => {
      const response = await request(app).post('/auth/register').send({
        firstName: 'Hugo',
        lastName: 'García',
        email: 'hugo@example.com',
        password: '123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'password' })])
      );
    });
  });

  describe('When POST /auth/register is called with multiple invalid fields', () => {
    it('Should return 400 with all validation errors', async () => {
      const response = await request(app).post('/auth/register').send({
        firstName: '',
        email: 'invalid',
        password: '123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('When POST /auth/login is called with valid credentials', () => {
    it('Should return 200 and the auth response', async () => {
      mockAuthService.login = jest.fn().mockResolvedValue(mockAuthResponse);

      const response = await request(app).post('/auth/login').send(mockLoginPayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAuthResponse);
    });
  });

  describe('When POST /auth/login is called with missing email', () => {
    it('Should return 400 with validation error', async () => {
      const response = await request(app).post('/auth/login').send({ password: 'SecurePass123!' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'email' })])
      );
    });
  });

  describe('When POST /auth/login is called with missing password', () => {
    it('Should return 400 with validation error', async () => {
      const response = await request(app).post('/auth/login').send({ email: 'hugo@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'password' })])
      );
    });
  });

  describe('When POST /auth/login is called with invalid email format', () => {
    it('Should return 400 with validation error', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'not-an-email', password: 'SecurePass123!' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'email' })])
      );
    });
  });

  describe('When GET /auth/me is called with a valid token', () => {
    it('Should return 200 and user data without password', async () => {
      mockAuthService.getMe = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${mockJwtToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: mockUser._id.toString(),
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        displayName: mockUser.displayName,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(response.body).not.toHaveProperty('password');
    });
  });

  describe('When GET /auth/me is called without a token', () => {
    it('Should return 401 with error message', async () => {
      const response = await request(app).get('/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'No token provided');
    });
  });

  describe('When POST to an invalid route', () => {
    it('Should return 404', async () => {
      const response = await request(app).post('/auth/invalid-route');

      expect(response.status).toBe(404);
    });
  });
});
