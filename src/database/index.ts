import 'dotenv/config';
import mongoose from 'mongoose';
import chalk from 'chalk';
import debugCreator from 'debug';

const debug = debugCreator('src:database:index');

const mongodbUrl = process.env.MONGODB_URL;
if (!mongodbUrl) {
  throw new Error('MONGODB_URL is not defined in environment variables');
}

export const connectToDatabase = async (mongoUrl: string) => {
  try {
    await mongoose.connect(mongoUrl);
    if (process.env['NODE_ENV'] === 'development') {
      mongoose.set('debug', true);
    }
    debug(chalk.green('Connected to database'));

    mongoose.connection.on('disconnected', () => {
      debug(chalk.yellow('MongoDB disconnected'));
    });

    mongoose.connection.on('error', (error) => {
      debug(chalk.red('MongoDB connection error:', error));
    });
  } catch (error) {
    debug(chalk.red("Couldn't connect to database:"), error);
    process.exit(1);
  }
};
