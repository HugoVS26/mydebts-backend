import cron from 'node-cron';
import chalk from 'chalk';
import debugCreator from 'debug';
import Debt from '../features/debts/models/debt.js';

const debug = debugCreator('jobs:overdue-debts');

export const startUpdateUnpaidToOverdueJob = (): void => {
  cron.schedule(' 0 0 * * *', async () => {
    const startTime = Date.now();
    debug(chalk.blue('[CRON] Running overdue debts check...'));

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await Debt.updateMany(
        {
          status: 'unpaid',
          dueDate: { $lt: today },
        },
        {
          $set: {
            status: 'overdue',
            updatedAt: new Date(),
          },
        }
      );

      const duration = Date.now() - startTime;

      if (result.modifiedCount > 0) {
        debug(
          chalk.green(`[CRON] Updated ${result.modifiedCount} debts to overdue (${duration}ms)`)
        );
      } else {
        debug(chalk.yellow(`[CRON] No debts to update (${duration}ms)`));
      }
    } catch (error) {
      debug(chalk.red('[CRON] Error updating overdue debts:'), error);
    }
  });

  debug(chalk.magenta('[CRON] Overdue debts job scheduled'));
};
