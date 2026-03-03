import 'dotenv/config';

console.log('Starting...');
console.log('ENV CHECK:', {
  JWT_SECRET: !!process.env['JWT_SECRET'],
  MONGODB_URL: !!process.env['MONGODB_URL'],
  NODE_ENV: process.env['NODE_ENV'],
  PORT: process.env['PORT'],
});

import { startServer } from './server/app.js';
import { connectToDatabase } from './database/index.js';
import './server/index.js';
import { startUpdateUnpaidToOverdueJob } from './jobs/updateUnpaidToOverdue.job.js';

console.log('All imports loaded');

try {
  const port = process.env['PORT'] ?? 4000;

  if (!process.env['MONGODB_URL']) {
    console.error('Missing MongoDB String');
    process.exit(1);
  }

  await connectToDatabase(process.env['MONGODB_URL']);
  startUpdateUnpaidToOverdueJob();
  startServer(+port);
} catch (error) {
  console.error('STARTUP ERROR:', error);
  process.exit(1);
}
