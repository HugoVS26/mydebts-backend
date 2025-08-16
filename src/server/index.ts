import morgan from 'morgan';
import cors from 'cors';
import { app } from './app.js';
import { corsOptions } from './utils/cors.js';
import pingRouter from '../features/ping/router/pingRouter.js';
import { generalError } from './middlewares/errors/errorsMiddleware.js';

app.use(morgan('dev'));
app.use(cors(corsOptions));

app.use('/', pingRouter);

app.use(generalError);
