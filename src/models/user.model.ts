import mongoose, { Schema, model } from 'mongoose';
import nameValidator from '../validators/user/name.validator';
import displayNameValidator from '../validators/user/displayName.validator';
import emailValidator from '../validators/user/email.validator';
import passwordValidator from '../validators/user/password.validator';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  displayName?: string;
}

const UserSchema = new mongoose.Schema({
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
    trim: true,
    minlength: [3, 'Display name must be at least 3 characters'],
    maxlength: [42, 'Display name must be at most 42 characters'],
    validate: displayNameValidator,
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
});

export default mongoose.model<IUser>('User', UserSchema);
