import { Response } from 'express';
import { AuthRequest } from '../../auth/middlewares/authMiddleware.js';
import { SharedDebtLinksService } from '../services/shared-debt-links.service.js';
import CustomError from '../../../server/middlewares/errors/CustomError/CustomError.js';

export class SharedDebtLinksController {
  constructor(private readonly sharedDebtLinksService: SharedDebtLinksService) {}

  async createShareLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { userId } = req;

      if (!userId) throw new CustomError('User not authenticated', 401, 'Authentication required');

      const token = await this.sharedDebtLinksService.createShareLink(id, userId);
      res.status(201).json({ token });
    } catch (error) {
      this.handleError(error, 'Error creating share link', 'Could not process request');
    }
  }

  async getByToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      const debt = await this.sharedDebtLinksService.getByToken(token);
      res.status(200).json(debt);
    } catch (error) {
      this.handleError(error, 'Error fetching shared debt', 'Could not process request');
    }
  }

  private handleError(
    error: unknown,
    message: string,
    publicMessage: string,
    statusCode = 500
  ): never {
    if (error instanceof CustomError) throw error;
    throw new CustomError(message, statusCode, publicMessage);
  }
}
