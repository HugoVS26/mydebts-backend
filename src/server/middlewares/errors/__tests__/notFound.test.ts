import { type NextFunction, type Request, type Response } from 'express';
import { notFound } from '../errorsMiddleware';
import CustomError from '../CustomError/CustomError';

describe('Given a notFound error', () => {
  describe('When it receives a next function', () => {
    test('Then it should call next function with a 400 code', () => {
      const req = {};
      const res = {};
      const next = jest.fn();
      const expectedError = new CustomError('Endpoint not found', 404);

      notFound(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith(expect.objectContaining(expectedError));
    });
  });
});
