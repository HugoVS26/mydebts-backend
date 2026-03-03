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
    debug(chalk.red('Missing MongoDB String'));
    process.exit(1);
  }

  await connectToDatabase(process.env['MONGODB_URL']);
  startUpdateUnpaidToOverdueJob();
  startServer(+port);
} catch (error) {
  console.error('STARTUP ERROR:', error);
  process.exit(1);
}
