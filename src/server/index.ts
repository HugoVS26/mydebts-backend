import morgan from 'morgan';
import cors from 'cors';
import { app } from './app.js';
import { corsOptions } from './utils/cors.js';

app.use(morgan('dev'));
app.use(cors(corsOptions));
