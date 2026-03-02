process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-secret';

jest.mock('chalk', () => ({
  green: (text: string) => text,
  yellow: (text: string) => text,
  red: (text: string) => text,
}));

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDatabase } from './database/index';

let server: MongoMemoryServer;

beforeAll(async () => {
  server = await MongoMemoryServer.create();
  const mongoDbUrl = server.getUri();
  await connectToDatabase(mongoDbUrl);
});

afterAll(async () => {
  await mongoose.disconnect();
  await server.stop();
});
