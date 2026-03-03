import 'dotenv/config';
import chalk from 'chalk';
import debugCreator from 'debug';
import { startServer } from './server/app.js';
import { connectToDatabase } from './database/index.js';
import './server/index.js';
import { startUpdateUnpaidToOverdueJob } from './jobs/updateUnpaidToOverdue.job.js';

const debug = debugCreator('src:index');

try {
  const port = process.env['PORT'] ?? 4000;

  if (!process.env['MONGODB_URL']) {
    console.error('Missing MongoDB String');
    process.exit(1);
  }

  const mongoUrl = process.env['MONGODB_URL'];

  await connectToDatabase(mongoUrl);
  startUpdateUnpaidToOverdueJob();
  startServer(+port);
} catch (error) {
  console.error('STARTUP ERROR:', error);
  process.exit(1);
}
