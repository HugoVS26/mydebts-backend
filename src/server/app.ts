import express from 'express';
import chalk from 'chalk';
import debugCreator from 'debug';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import { corsOptions } from './configs/cors.js';

const debug = debugCreator('src:server:app');
export const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  mongoSanitize.sanitize(req.body);
  next();
});

export const startServer = (port: number) => {
  app.listen(port, '0.0.0.0', () => {
    debug(chalk.green(`Listening on http://0.0.0.0:${port}`));
  });
};

export default app;
