import { Request, Response, NextFunction } from 'express';
import CustomError from './CustomError/CustomError.js';
import chalk from 'chalk';
import mongoose from 'mongoose';
import debugCreator from 'debug';

const debug = debugCreator('src:server:middlewares:errors:CustomError:CustomError');
const isProduction = process.env['NODE_ENV'] === 'production';

export const notFound = (_req: Request, _res: Response, next: NextFunction) => {
  const customError = new CustomError('Endpoint not found', 404);
  next(customError);
};

export const generalError = (error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof mongoose.Error.ValidationError) {
    const validationErrors: Record<string, string> = {};
    for (const field in error.errors) {
      validationErrors[field] = error.errors[field].message;
    }
    debug(chalk.yellow('Validation error:', JSON.stringify(validationErrors, null, 2)));
    return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
  }

  if (error instanceof CustomError) {
    const statusCode = error.statusCode ?? 500;
    const publicMessage = error.publicMessage ?? error.message;
    debug(chalk.red('Custom error:', error.message));
    return res.status(statusCode).json({ error: publicMessage });
  }

  // Unknown errors — never leak details in production
  const message = error instanceof Error ? error.message : 'Unknown error';
  debug(chalk.red('Unknown error:', message));
  if (!isProduction) {
    debug(chalk.red('Stack:', (error as Error).stack));
  }

  return res.status(500).json({ error: 'Internal server error' });
};
