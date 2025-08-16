import debugCreator from 'debug';
import type CustomError from './CustomError/CustomError';
import { type NextFunction, type Request, type Response } from 'express';
import chalk from 'chalk';

const debug = debugCreator('src:server:middleware:error:errorsMiddleware');

export const generalError = (
  error: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = error.statusCode ?? 500;
  const publicMessage = error.publicMessage ?? error.message;

  debug(chalk.red('Error: ', publicMessage));

  res.status(statusCode).json({ error: error.message });
};
