import express, { Request, Response } from 'express';
import request from 'supertest';
import createDebtsRouter from './debtsRouter';
import { updatedDebtMock } from '../mocks/debtsMock';

describe('Given a debtsRouter', () => {
  let app: express.Express;
  let controllerMock: any;
  const debtIdMock = '64e52d9f1a2b3c4d5e6f7a02';

  beforeEach(() => {
    controllerMock = {
      getDebts: jest.fn((_req: Request, res: Response) =>
        res.status(200).json({ message: 'ok' })
      ),
      getDebtsByFilter: jest.fn((_req: Request, res: Response) =>
        res.status(200).json({ message: 'ok' })
      ),
      getDebtById: jest.fn((_req: Request, res: Response) =>
        res.status(200).json({ message: 'ok' })
      ),
      createDebt: jest.fn((_req: Request, res: Response) =>
        res.status(201).json({ message: 'created' })
      ),
      updateDebt: jest.fn((_req: Request, res: Response) =>
        res.status(200).json({ message: 'updated' })
      ),
      deleteDebt: jest.fn((_req: Request, res: Response) =>
        res.status(200).json({ message: 'deleted' })
      ),
      markDebtAsPaid: jest.fn((_req: Request, res: Response) =>
        res.status(200).json({ message: 'paid' })
      ),
    };

    app = express();
    app.use(express.json());
    app.use('/debts', createDebtsRouter(controllerMock));
  });

  describe('When GET / endpoint receives a request', () => {
    test('Then it should call getDebts method', async () => {
      await request(app).get('/debts').expect(200);

      expect(controllerMock.getDebts).toHaveBeenCalled();
    });
  });

  describe('When GET /filter endpoint receives a request', () => {
    test('Then it should call getDebtsByFilter method', async () => {
      await request(app).get('/debts/filter').expect(200);

      expect(controllerMock.getDebtsByFilter).toHaveBeenCalled();
    });
  });

  describe('When GET /:debtId endpoint receives a request', () => {
    test('Then it should call getDebtById method', async () => {
      await request(app).get(`/debts/${debtIdMock}`).expect(200);

      expect(controllerMock.getDebtById).toHaveBeenCalled();
    });
  });

  describe('When POST / endpoint receives a request', () => {
    test('Then it should call createDebt method', async () => {
      await request(app).post('/debts').send(updatedDebtMock).expect(201);

      expect(controllerMock.createDebt).toHaveBeenCalled();
    });
  });

  describe('When PUT /:debtId endpoint receives a request', () => {
    test('Then it should call updateDebt method', async () => {
      await request(app)
        .put(`/debts/${debtIdMock}`)
        .send(updatedDebtMock)
        .expect(200);

      expect(controllerMock.updateDebt).toHaveBeenCalled();
    });
  });

  describe('When DELETE /:debtId endpoint receives a request', () => {
    test('Then it should call deleteDebt method', async () => {
      await request(app).delete(`/debts/${debtIdMock}`).expect(200);

      expect(controllerMock.deleteDebt).toHaveBeenCalled();
    });
  });

  describe('When PATCH /:debtId/paid endpoint receives a request', () => {
    test('Then it should call markDebtAsPaid method', async () => {
      await request(app).patch(`/debts/${debtIdMock}/paid`).expect(200);

      expect(controllerMock.markDebtAsPaid).toHaveBeenCalled();
    });
  });
});
