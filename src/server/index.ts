import morgan from 'morgan';
import cors from 'cors';
import { app } from './app.js';
import { corsOptions } from './utils/cors.js';
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

app.use(morgan('dev'));
app.use(cors(corsOptions));

const debtsRepository = new DebtsRepository();
const debtsController = new DebtsController(debtsRepository);

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

app.use('/ping', pingRouter);
app.use('/auth', createAuthRouter(authController));

app.use('/debts', authMiddleware, createDebtsRouter(debtsController));

app.use(notFound);
app.use(generalError);
