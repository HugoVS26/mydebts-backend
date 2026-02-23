import User from '../models/user.js';
import { IUser, IUserRepository } from '../types/types.js';

class UserRepository implements IUserRepository {
  public async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select('+password').lean().exec();
  }

  public async findById(id: string): Promise<IUser | null> {
    return User.findById(id).lean().exec();
  }

  public async findByResetToken(token: string): Promise<IUser | null> {
    return User.findOne({ resetPasswordToken: token })
      .select('+resetPasswordToken +resetPasswordExpires')
      .lean()
      .exec();
  }

  public async create(
    data: Pick<IUser, 'firstName' | 'lastName' | 'email' | 'password'>
  ): Promise<IUser> {
    const user = new User(data);
    return user.save().then((u) => u.toObject());
  }

  public async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { password: hashedPassword });
  }

  public async setResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });
  }

  public async clearResetToken(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }
}

export default UserRepository;
