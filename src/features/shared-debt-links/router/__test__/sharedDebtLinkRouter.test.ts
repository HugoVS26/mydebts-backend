import express, { Request, Response } from 'express';
import request from 'supertest';
import createSharedDebtLinksRouter from '../sharedDebtLinksRouter.js';

jest.mock('../../../auth/middlewares/authMiddleware.js', () => ({
  authMiddleware: (_req: any, _res: any, next: any) => next(),
}));

describe('Given a sharedDebtLinksRouter', () => {
  let app: express.Express;
  let controllerMock: any;
  const debtIdMock = '64e52d9f1a2b3c4d5e6f7a02';
  const tokenMock = 'abc123token';

  beforeEach(() => {
    controllerMock = {
      createShareLink: jest.fn((_req: Request, res: Response) =>
        res.status(201).json({ token: tokenMock })
      ),
      getByToken: jest.fn((_req: Request, res: Response) =>
        res.status(200).json({ message: 'ok' })
      ),
    };

    app = express();
    app.use(express.json());
    app.use('/', createSharedDebtLinksRouter(controllerMock));
  });

  describe('When POST /debts/:id/share endpoint receives a request', () => {
    test('Should call createShareLink method', async () => {
      await request(app).post(`/debts/${debtIdMock}/share`).expect(201);

      expect(controllerMock.createShareLink).toHaveBeenCalled();
    });
  });

  describe('When GET /share/:token endpoint receives a request', () => {
    test('Should call getByToken method', async () => {
      await request(app).get(`/share/${tokenMock}`).expect(200);

      expect(controllerMock.getByToken).toHaveBeenCalled();
    });
  });
});
