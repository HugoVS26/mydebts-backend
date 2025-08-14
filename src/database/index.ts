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
    mongoose.set('debug', true);
    debug(chalk.green('Connected to database'));
  } catch (error) {
    debug(chalk.red("Couldn't connect to database:"), error);
    process.exit(1);
  }
};
