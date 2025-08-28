import morgan from 'morgan';
import cors from 'cors';
import { app } from './app.js';
import { corsOptions } from './utils/cors.js';
import {
  generalError,
  notFound,
} from './middlewares/errors/errorsMiddleware.js';
import pingRouter from '../features/ping/router/pingRouter.js';
import createDebtsRouter from '../features/debts/router/debtsRouter.js';
import DebtsMongooseRepository from '../features/debts/repository/DebtsMongooseRepository.js';
import DebtsController from '../features/debts/controller/DebtsController.js';

app.use(morgan('dev'));
app.use(cors(corsOptions));

const debtsMongooseRepository = new DebtsMongooseRepository();
const debtsController = new DebtsController(debtsMongooseRepository);

app.use('/debts', createDebtsRouter(debtsController));
app.use('/ping', pingRouter);

app.use(notFound);
app.use(generalError);
