import { Router } from 'express';
import { AuthController } from '../controller/AuthController';
import { registerSchema } from '../validators/request/register.schema.js';
import { loginSchema } from '../validators/request/login.schema.js';
import { validateRequest } from '../../../server/middlewares/validators/validateRequest.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto.js';
import { ResetPasswordDto } from '../dtos/reset-password.dto.js';
import { validateTurnstile } from '../../../server/middlewares/validators/validateTurnstile.js';

export default function createAuthRouter(controller: AuthController) {
  const router = Router();

  router.post(
    '/register',
    validateTurnstile,
    validateRequest(registerSchema),
    controller.register.bind(controller)
  );

  router.post(
    '/login',
    validateTurnstile,
    validateRequest(loginSchema),
    controller.login.bind(controller)
  );

  router.get('/me', authMiddleware, (req, res) => controller.me(req, res));

  router.post(
    '/forgot-password',
    validateTurnstile,
    validateRequest(ForgotPasswordDto),
    controller.forgotPassword.bind(controller)
  );

  router.post(
    '/reset-password',
    validateRequest(ResetPasswordDto),
    controller.resetPassword.bind(controller)
  );

  return router;
}
