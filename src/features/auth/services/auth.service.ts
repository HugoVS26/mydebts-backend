import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Resend } from 'resend';

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

  public async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await this.userRepository.setResetToken(user._id.toString(), token, expires);
    try {
      await this.sendResetEmail(email, token);
    } catch (error) {
      console.error('SMTP Error:', error);
      throw error;
    }
  }

  public async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByResetToken(token);

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new CustomError('Invalid or expired token', 400, 'Invalid or expired reset token');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updatePassword(user._id.toString(), hashed);
    await this.userRepository.clearResetToken(user._id.toString());
  }

  private async sendResetEmail(email: string, token: string): Promise<void> {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: `"MyDebts" <${process.env.RESEND_FROM}>`,
      to: email,
      subject: 'MyDebts - Password Reset',
      html: `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        @media only screen and (max-width: 600px) {
          .email-wrapper { padding: 16px 0 !important; }
          .email-container { width: 100% !important; border-radius: 0 !important; }
          .email-header { padding: 24px !important; }
          .email-body { padding: 24px !important; }
          .email-footer { padding: 16px 24px !important; }
          .reset-button a { padding: 14px 24px !important; }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
      <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
        <tr>
          <td align="center">
            <table class="email-container" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

              <!-- Header -->
              <tr>
                <td class="email-header" style="background-color:#1a1a2e;padding:32px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:1px;">MyDebts</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td class="email-body" style="padding:40px 48px;">
                  <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;">Reset your password</h2>
                  <p style="margin:0 0 16px;color:#555555;font-size:15px;line-height:1.6;">
                    We received a request to reset the password for your MyDebts account. Click the button below to choose a new password.
                  </p>
                  <p style="margin:0 0 32px;color:#555555;font-size:15px;line-height:1.6;">
                    This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your password will not be changed.
                  </p>

                  <!-- Button -->
                  <table class="reset-button" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" style="background-color:#4f46e5;border-radius:6px;">
                        <a href="${resetUrl}" style="display:block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;text-align:center;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Fallback URL -->
                  <p style="margin:32px 0 0;color:#888888;font-size:13px;line-height:1.6;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <p style="margin:4px 0 0;font-size:13px;">
                    <a href="${resetUrl}" style="color:#4f46e5;word-break:break-all;">${resetUrl}</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td class="email-footer" style="background-color:#f4f4f5;padding:24px 48px;text-align:center;">
                  <p style="margin:0;color:#aaaaaa;font-size:12px;line-height:1.6;">
                    This email was sent by MyDebts. If you did not request a password reset, please ignore this email.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`,
    });
  }
}
