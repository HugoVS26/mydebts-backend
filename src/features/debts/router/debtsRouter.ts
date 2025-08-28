import { Router } from 'express';
import DebtsController from '../controller/DebtsController.js';

export default function createDebtsRouter(controller: DebtsController) {
  const router = Router();

  router.get('/', controller.getDebts.bind(controller));
  router.get('/filter', controller.getDebtsByFilter.bind(controller));
  router.get('/:debtId', controller.getDebtById.bind(controller));
  router.post('/', controller.createDebt.bind(controller));
  router.put('/:debtId', controller.updateDebt.bind(controller));
  router.delete('/:debtId', controller.deleteDebt.bind(controller));
  router.patch('/:debtId/paid', controller.markDebtAsPaid.bind(controller));

  return router;
}
