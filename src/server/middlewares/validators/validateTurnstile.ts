import { Request, Response, NextFunction } from 'express';
import CustomError from '../errors/CustomError/CustomError.js';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export const validateTurnstile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.body.turnstileToken;

  if (!token) {
    throw new CustomError('Missing Turnstile token', 400, 'Bot verification required');
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: req.ip,
    }),
  });

  const data = (await response.json()) as { success: boolean };

  if (!data.success) {
    throw new CustomError('Turnstile verification failed', 403, 'Bot verification failed');
  }

  next();
};
