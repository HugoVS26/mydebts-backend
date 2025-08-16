import debugCreator from 'debug';
import CustomError from './CustomError/CustomError.js';
import { type NextFunction, type Request, type Response } from 'express';
import chalk from 'chalk';

const debug = debugCreator('src:server:middleware:error:errorsMiddleware');

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

  debug(chalk.red('Error: ', publicMessage));

  res.status(statusCode).json({ error: error.message });
};
