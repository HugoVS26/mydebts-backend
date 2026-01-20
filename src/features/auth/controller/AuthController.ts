import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../../users/models/user.js';
import { RegisterRequest, LoginRequest, AuthResponse } from '../types/requests';
import { IUser } from '../../users/types/types';
import CustomError from '../../../server/middlewares/errors/CustomError/CustomError.js';

export class AuthController {
  public async register(req: Request<{}, {}, RegisterRequest>, res: Response): Promise<void> {
    try {
      const { firstName, lastName, email, password } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new CustomError('Email already registered', 409, 'Email already in use');
      }

      // Create user (displayName + password hashing handled by pre-save hooks)
      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
      });

      // Generate token and response
      const authResponse = this.generateAuthResponse(user);

      res.status(201).json(authResponse);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw error;
      }

      this.handleError(error, 'Error registering user', 'Could not create user account');
    }
  }

  public async login(req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user and include password field
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new CustomError('Invalid credentials', 401, 'Invalid email or password');
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        throw new CustomError('Invalid credentials', 401, 'Invalid email or password');
      }

      // Generate token and response
      const authResponse = this.generateAuthResponse(user);

      res.status(200).json(authResponse);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        throw error;
      }

      this.handleError(error, 'Error logging in', 'Could not authenticate user', 401);
    }
  }

  private generateAuthResponse(user: IUser): AuthResponse {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured in environment variables');
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
      },
    };
  }

  private handleError(
    error: unknown,
    message: string,
    publicMessage: string,
    statusCode = 500
  ): never {
    if (error instanceof CustomError) throw error;
    throw new CustomError(message, statusCode, publicMessage);
  }
}
