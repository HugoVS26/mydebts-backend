import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findByResetToken(token: string): Promise<IUser | null>;
  create(data: Pick<IUser, 'firstName' | 'lastName' | 'email' | 'password'>): Promise<IUser>;
  updatePassword(userId: string, hashedPassword: string): Promise<void>;
  setResetToken(userId: string, token: string, expires: Date): Promise<void>;
  clearResetToken(userId: string): Promise<void>;
}

export type IUserSummary = Pick<IUser, '_id' | 'firstName' | 'lastName' | 'displayName'>;
