import { Request, Response, NextFunction } from 'express';
import CustomError from './CustomError/CustomError.js';
import debug from 'debug';
import chalk from 'chalk';

export const notFound = (_req: Request, _res: Response, next: NextFunction) => {
  const customError = new CustomError('Endpoint not found', 404);
  next(customError);
};

export const generalError = (
  error: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = error.statusCode ?? 500;
  const publicMessage = error.publicMessage ?? error.message;

  debug(chalk.red('Error: ', error.message));

  res.status(statusCode).json({ error: publicMessage });
};
