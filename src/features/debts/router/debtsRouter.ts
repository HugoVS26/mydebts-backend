import { Router } from 'express';
import DebtsController from '../controller/DebtsController.js';
import { validateDebtSchema } from '../../../server/middlewares/validators/validateDebts.js';
import { createDebtSchema } from '../validators/request/debtCreate.schema.js';
import { updateDebtSchema } from '../validators/request/debtUpdate.schema.js';

export default function createDebtsRouter(controller: DebtsController) {
  const router = Router();

  router.get('/', controller.getDebts.bind(controller));
  router.get('/filter', controller.getDebtsByFilter.bind(controller));
  router.get('/:debtId', controller.getDebtById.bind(controller));
  router.post('/', validateDebtSchema(createDebtSchema), controller.createDebt.bind(controller));
  router.put(
    '/:debtId',
    validateDebtSchema(updateDebtSchema),
    controller.updateDebt.bind(controller)
  );
  router.delete('/:debtId', controller.deleteDebt.bind(controller));
  router.patch('/:debtId/paid', controller.markDebtAsPaid.bind(controller));

  return router;
}
