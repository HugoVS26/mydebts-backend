import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { AuthResponse } from '../types/requests.js';
import { IUser, IUserRepository } from '../../users/types/types.js';
import CustomError from '../../../server/middlewares/errors/CustomError/CustomError.js';

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  public async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new CustomError('Email already registered', 409, 'Email already in use');
    }

    const user = await this.userRepository.create({ firstName, lastName, email, password });
    return this.generateAuthResponse(user);
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new CustomError('Invalid credentials', 401, 'Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.password!);
    if (!isValid) {
      throw new CustomError('Invalid credentials', 401, 'Invalid email or password');
    }

    return this.generateAuthResponse(user);
  }

  public async getMe(userId: string): Promise<IUser> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new CustomError('User not found', 404, 'User account not found');
    }

    return user;
  }

  private generateAuthResponse(user: IUser): AuthResponse {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
      },
    };
  }
}
