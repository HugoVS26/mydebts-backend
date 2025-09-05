import { type Request } from 'express';
import { IDebtCreate } from './debt';

export type DebtRequestById = Request<{ debtId: string }>;

export type DebtRequestWithoutId = Request<
  Record<string, unknown>,
  Record<string, unknown>,
  IDebtCreate
>;

export type DebtRequestByFilter = Request<
  Record<string, never>,
  Record<string, unknown>,
  Omit<IDebtCreate, '_id'>
>;
