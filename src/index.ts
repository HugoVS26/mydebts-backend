import 'dotenv/config';
import chalk from 'chalk';
import debugCreator from 'debug';
import { startServer } from './server/app.js';
import { connectToDatabase } from './database/index.js';
import './server/index.js';

const debug = debugCreator('src:index');

const port = process.env.PORT ?? 4000;
if (!process.env.MONGODB_URL) {
  debug(chalk.red('Missing MongoDB String'));
  process.exit(1);
}

const mongoUrl = process.env.MONGODB_URL;

await connectToDatabase(mongoUrl);
startServer(+port);
