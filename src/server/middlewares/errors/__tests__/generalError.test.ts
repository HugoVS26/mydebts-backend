import { type NextFunction, type Request, type Response } from 'express';
import CustomError from '../CustomError/CustomError.js';
import { generalError } from '../errorsMiddleware.js';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Given a generalError middleware', () => {
  const request = {};
  const response: Pick<Response, 'status' | 'json'> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();

  describe('When it receives a response and a 400 error', () => {
    test('Then it should call the response method with status code 400', () => {
      const expectedStatusCode = 400;
      const error = new CustomError('error', expectedStatusCode);

      generalError(error, request as Request, response as Response, next);

      expect(response.status).toHaveBeenCalledWith(expectedStatusCode);
    });
  });

  describe('When it receives a response and an error with the message `Unknown Error`', () => {
    test('Then it should call the response method  json with a `Unknown Error` message ', () => {
      const errorMessage = 'Unknown Error';
      const error = new CustomError(errorMessage, 400);

      generalError(error, request as Request, response as Response, next);

      const errorResponseBody = {
        error: errorMessage,
      };

      expect(response.json).toHaveBeenCalledWith(errorResponseBody);
    });
  });

  describe('When it receives a response and an error without status code', () => {
    test("Then it should call the response's method with status code 500 ", () => {
      const expectedStatusCode = 500;
      const error = new Error('Error without status code');

      generalError(
        error as CustomError,
        request as Request,
        response as Response,
        next as NextFunction
      );

      expect(response.status).toHaveBeenCalledWith(expectedStatusCode);
    });
  });
});
