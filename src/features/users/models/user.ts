import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import nameValidator from '../validators/name.validator.js';
import emailValidator from '../validators/email.validator.js';
import passwordValidator from '../validators/password.validator.js';
import { IUser } from '../types/types';

const UserSchema = new mongoose.Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [1, 'First name must be at least 1 character'],
      maxlength: [20, 'First name must be at most 20 characters'],
      validate: nameValidator,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [1, 'Last name must be at least 1 character'],
      maxlength: [20, 'Last name must be at most 20 characters'],
      validate: nameValidator,
    },
    displayName: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: [100, 'Email must be at most 100 characters'],
      validate: emailValidator,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      maxlength: [100, 'Password must be at most 100 characters'],
      validate: passwordValidator,
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: 'Role must be either "user" or "admin"',
      },
      default: 'user',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserSchema.pre('save', function (next) {
  if (this.firstName && this.lastName) {
    this.displayName = `${this.firstName} ${this.lastName.charAt(0).toUpperCase()}.`;
  }
  next();
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    if (this.password) {
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
