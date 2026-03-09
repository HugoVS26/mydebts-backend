import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../../auth/middlewares/authMiddleware.js';
import { SharedDebtLinksController } from '../controller/SharedDebtLinksController.js';

const createSharedDebtLinksRouter = (controller: SharedDebtLinksController) => {
  const router = Router();

  router.post('/debts/:id/share', authMiddleware, (req, res) =>
    controller.createShareLink(req as AuthRequest, res)
  );
  router.get('/share/:token', (req, res) => controller.getByToken(req as AuthRequest, res));

  return router;
};

export default createSharedDebtLinksRouter;
