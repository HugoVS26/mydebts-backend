import { type Request, type Response } from 'express';
import PingController from './PingController';

beforeAll(() => {
  jest.clearAllMocks();
});

describe("Given a PingController's method getPong", () => {
  describe('When it receives a response', () => {
    const pingController = new PingController();
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    const mockResponse = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;

    test("Then it should call the response's method status with 200 status code", () => {
      pingController.getPong({} as Request, mockResponse);

      expect(statusMock).toHaveBeenCalledWith(200);
    });

    test("Then it should call the response's method json with 'Leeeeroy Jenkins!' as message", () => {
      pingController.getPong({} as Request, mockResponse);

      expect(jsonMock).toHaveBeenCalledWith({ message: 'Leeeeroy Jenkins!' });
    });
  });
});
