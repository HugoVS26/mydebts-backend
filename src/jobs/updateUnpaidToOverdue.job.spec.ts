import cron, { type ScheduledTask } from 'node-cron';
import { startUpdateUnpaidToOverdueJob } from './updateUnpaidToOverdue.job';
import Debt from '../features/debts/models/debt';

jest.mock('node-cron');
jest.mock('../features/debts/models/debt');

describe('Given the overdue debts cron job', () => {
  let cronCallback: () => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();

    (cron.schedule as jest.Mock).mockImplementation((schedule, callback) => {
      cronCallback = callback as () => Promise<void>;
      return {} as ScheduledTask;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('When the job is initialized', () => {
    it('Should schedule a cron job with correct schedule', () => {
      startUpdateUnpaidToOverdueJob();

      expect(cron.schedule).toHaveBeenCalledWith('0 0 * * *', expect.any(Function));
    });
  });

  describe('When the cron job runs', () => {
    it('Should update unpaid debts with past due dates to overdue', async () => {
      const mockUpdateResult = {
        modifiedCount: 3,
        matchedCount: 3,
        acknowledged: true,
      };

      (Debt.updateMany as jest.Mock).mockResolvedValue(mockUpdateResult);

      startUpdateUnpaidToOverdueJob();
      await cronCallback();

      expect(Debt.updateMany).toHaveBeenCalledWith(
        {
          status: 'unpaid',
          dueDate: { $lt: expect.any(Date) },
        },
        {
          $set: {
            status: 'overdue',
            updatedAt: expect.any(Date),
          },
        }
      );
    });

    it('Should handle case when no debts need updating', async () => {
      const mockUpdateResult = {
        modifiedCount: 0,
        matchedCount: 0,
        acknowledged: true,
      };

      (Debt.updateMany as jest.Mock).mockResolvedValue(mockUpdateResult);

      startUpdateUnpaidToOverdueJob();
      await cronCallback();

      expect(Debt.updateMany).toHaveBeenCalled();
    });

    it('Should handle errors gracefully', async () => {
      const mockError = new Error('Database connection failed');
      (Debt.updateMany as jest.Mock).mockRejectedValue(mockError);

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      startUpdateUnpaidToOverdueJob();
      await cronCallback();

      expect(Debt.updateMany).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('When checking date logic', () => {
    it('Should query for debts with dueDate before today at midnight', async () => {
      const mockUpdateResult = {
        modifiedCount: 0,
        matchedCount: 0,
        acknowledged: true,
      };

      (Debt.updateMany as jest.Mock).mockResolvedValue(mockUpdateResult);

      startUpdateUnpaidToOverdueJob();
      await cronCallback();

      const callArgs = (Debt.updateMany as jest.Mock).mock.calls[0];
      const queryFilter = callArgs[0];

      expect(queryFilter.dueDate.$lt).toBeInstanceOf(Date);

      const queryDate = new Date(queryFilter.dueDate.$lt);
      expect(queryDate.getHours()).toBe(0);
      expect(queryDate.getMinutes()).toBe(0);
      expect(queryDate.getSeconds()).toBe(0);
      expect(queryDate.getMilliseconds()).toBe(0);
    });
  });
});
