import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { registerSchema } from '../validators/request/register.schema.js';
import { loginSchema } from '../validators/request/login.schema.js';
import { validateRequest } from '../../../server/middlewares/validators/validateRequest.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export default function createAuthRouter(controller: AuthController) {
  const router = Router();

  router.post('/register', validateRequest(registerSchema), controller.register.bind(controller));

  router.post('/login', validateRequest(loginSchema), controller.login.bind(controller));

  router.get('/me', authMiddleware, (req, res) => controller.me(req, res));

  return router;
}
