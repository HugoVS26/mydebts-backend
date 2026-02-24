import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { RegisterRequest, LoginRequest } from '../types/requests.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';
import { AuthService } from '../services/auth.service.js';
import CustomError from '../../../server/middlewares/errors/CustomError/CustomError.js';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public async register(req: Request<{}, {}, RegisterRequest>, res: Response): Promise<void> {
    try {
      const { firstName, lastName, email, password } = req.body;
      const authResponse = await this.authService.register(firstName, lastName, email, password);
      res.status(201).json(authResponse);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) throw error;
      this.handleError(error, 'Error registering user', 'Could not create user account');
    }
  }

  public async login(req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const authResponse = await this.authService.login(email, password);
      res.status(200).json(authResponse);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) throw error;
      this.handleError(error, 'Error logging in', 'Could not authenticate user', 401);
    }
  }

  public async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req;
      if (!userId) {
        throw new CustomError('User not authenticated', 401, 'Authentication required');
      }

      const user = await this.authService.getMe(userId);
      res.status(200).json({
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      this.handleError(error, 'Error fetching user', 'Could not retrieve user information');
    }
  }

  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await this.authService.forgotPassword(email);
      res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (error) {
      this.handleError(error, 'Error sending reset email', 'Could not process request');
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      await this.authService.resetPassword(token, newPassword);
      res.status(200).json({ message: 'Password reset successfully.' });
    } catch (error) {
      this.handleError(error, 'Error resetting password', 'Could not reset password');
    }
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
