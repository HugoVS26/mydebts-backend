import 'dotenv/config';
import express from 'express';
import chalk from 'chalk';
import debugCreator from 'debug';

const debug = debugCreator('src:server:app');
export const app = express();

app.disable('x-powered-by');
app.use(express.json());

export const startServer = (port: number) => {
  app.listen(port, () => {
    debug(chalk.green(`Listening on http://localhost:${port}`));
  });
};

export default app;
