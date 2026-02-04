import mongoose from 'mongoose';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types/requests';

export const mockUser = {
  _id: new mongoose.Types.ObjectId('676f1234567890abcdef1234'),
  firstName: 'Hugo',
  lastName: 'García',
  displayName: 'Hugo G.',
  email: 'hugo@example.com',
  password: 'hashed-password',
  role: 'user' as const,
  comparePassword: jest.fn(),
};

export const mockAdminUser = {
  _id: new mongoose.Types.ObjectId('676f1234567890abcdef9999'),
  firstName: 'Admin',
  lastName: 'User',
  displayName: 'Admin U.',
  email: 'admin@example.com',
  password: 'hashed-password',
  role: 'admin' as const,
  comparePassword: jest.fn(),
};

export const mockRegisterPayload: RegisterRequest = {
  firstName: 'Hugo',
  lastName: 'García',
  email: 'hugo@example.com',
  password: 'SecurePass123!',
};

export const mockLoginPayload: LoginRequest = {
  email: 'hugo@example.com',
  password: 'SecurePass123!',
};

export const mockLoginPayloadWrongPassword: LoginRequest = {
  email: 'hugo@example.com',
  password: 'WrongPassword123!',
};

export const mockLoginPayloadNonExistent: LoginRequest = {
  email: 'nonexistent@example.com',
  password: 'SecurePass123!',
};

export const mockJwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token';

export const mockJwtPayload = {
  userId: mockUser._id.toString(),
  email: mockUser.email,
  role: mockUser.role,
};

export const mockAuthResponse: AuthResponse = {
  token: mockJwtToken,
  user: {
    _id: mockUser._id.toString(),
    firstName: mockUser.firstName,
    lastName: mockUser.lastName,
    displayName: mockUser.displayName,
    email: mockUser.email,
    role: mockUser.role,
  },
};
