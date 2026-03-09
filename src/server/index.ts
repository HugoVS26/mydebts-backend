import morgan from 'morgan';
import { app } from './app.js';
import { generalError, notFound } from './middlewares/errors/errorsMiddleware.js';
import pingRouter from '../features/ping/router/pingRouter.js';
import createDebtsRouter from '../features/debts/router/debtsRouter.js';
import DebtsRepository from '../features/debts/repository/DebtsRepository.js';
import DebtsController from '../features/debts/controller/DebtsController.js';
import createAuthRouter from '../features/auth/router/authRouter.js';
import { AuthController } from '../features/auth/controller/AuthController.js';
import { authMiddleware } from '../features/auth/middlewares/authMiddleware.js';
import UserRepository from '../features/users/repository/UserRepository.js';
import { AuthService } from '../features/auth/services/auth.service.js';
import { SharedDebtLinksRepository } from '../features/shared-debt-links/repository/SharedDebtLinksRepository.js';
import { SharedDebtLinksService } from '../features/shared-debt-links/services/shared-debt-links.service.js';
import { SharedDebtLinksController } from '../features/shared-debt-links/controller/SharedDebtLinksController.js';
import createSharedDebtLinksRouter from '../features/shared-debt-links/router/sharedDebtLinksRouter.js';

app.use(
  morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev', {
    skip: (req) => req.url === '/ping',
  })
);

const debtsRepository = new DebtsRepository();
const debtsController = new DebtsController(debtsRepository);

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

const sharedDebtLinksRepository = new SharedDebtLinksRepository();
const sharedDebtLinksService = new SharedDebtLinksService(
  sharedDebtLinksRepository,
  debtsRepository
);
const sharedDebtLinksController = new SharedDebtLinksController(sharedDebtLinksService);

app.use('/ping', pingRouter);
app.use('/auth', createAuthRouter(authController));

app.use('/debts', authMiddleware, createDebtsRouter(debtsController));

app.use('/', createSharedDebtLinksRouter(sharedDebtLinksController));

app.use(notFound);
app.use(generalError);

export { app } from './app.js';
