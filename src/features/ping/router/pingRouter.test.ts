import request from 'supertest';
import { Express } from 'express';

let app: Express;

beforeAll(() => {
  app = require('../../../server/index').app;
});

describe('Given a GET / endpoint', () => {
  describe('When it receives a request', () => {
    test("Then it should respond with status code 200 and the message 'Leeeeroy Jenkins!'", async () => {
      const path = '/ping';
      const expectedStatusCode = 200;
      const expectedMessage = 'Leeeeroy Jenkins!';

      const response = await request(app).get(path).send();

      expect(response.status).toBe(expectedStatusCode);
      expect(response.body).toHaveProperty('message', expectedMessage);
    });
  });
});
