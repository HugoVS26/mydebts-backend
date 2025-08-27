import { type Request } from 'express';
import { DebtFilter, IDebt } from './debt';

export type DebtRequestById = Request<{ debtId: string }>;

export type DebtRequestWithoutId = Request<
  Record<string, unknown>,
  Record<string, unknown>,
  Omit<IDebt, '_id'>
>;

export type DebtRequestByFilter = Request<
  Record<string, never>,
  Record<string, unknown>,
  unknown,
  DebtFilter
>;
