import mongoose from 'mongoose';
import { IDebt } from '../types/debt';

export const mockedObjectId1 = new mongoose.Types.ObjectId(
  '64e52d9f1a2b3c4d5e6f7a01'
);
export const mockedObjectId2 = new mongoose.Types.ObjectId(
  '64e52d9f1a2b3c4d5e6f7a02'
);
export const mockedObjectId3 = new mongoose.Types.ObjectId(
  '64e52d9f1a2b3c4d5e6f7a03'
);

const mockedDate1 = new Date('2025-01-01T00:00:00.000Z');
const mockedDate2 = new Date('2025-02-01T00:00:00.000Z');
const mockedDate3 = new Date('2025-03-01T00:00:00.000Z');

export const debtsMock: IDebt[] = [
  {
    _id: mockedObjectId1,
    debtor: mockedObjectId2,
    creditor: mockedObjectId3,
    amount: 100,
    description: 'Loan payment',
    debtDate: mockedDate1,
    dueDate: mockedDate2,
    status: 'unpaid',
    createdAt: mockedDate1,
    updatedAt: mockedDate1,
  },
  {
    _id: mockedObjectId2,
    debtor: mockedObjectId3,
    creditor: mockedObjectId1,
    amount: 250,
    description: 'Service fee',
    debtDate: mockedDate2,
    dueDate: mockedDate3,
    status: 'paid',
    createdAt: mockedDate2,
    updatedAt: mockedDate2,
  },
  {
    _id: mockedObjectId3,
    debtor: mockedObjectId1,
    creditor: mockedObjectId2,
    amount: 75,
    description: 'Shared expense',
    debtDate: mockedDate3,
    dueDate: mockedDate3,
    status: 'overdue',
    createdAt: mockedDate3,
    updatedAt: mockedDate3,
  },
];

export const updatedDebtMock: IDebt = {
  _id: mockedObjectId1,
  debtor: mockedObjectId2,
  creditor: mockedObjectId3,
  amount: 40,
  description: 'Loan payment',
  debtDate: mockedDate1,
  dueDate: mockedDate2,
  status: 'unpaid',
  createdAt: mockedDate1,
  updatedAt: mockedDate1,
};
