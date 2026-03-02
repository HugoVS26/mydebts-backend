import { CorsOptions } from 'cors';

const allowedOrigins = [process.env['FRONT_URL']!];

if (process.env['NODE_ENV'] !== 'production') {
  allowedOrigins.push('http://localhost:4200', 'http://localhost:4000', 'http://localhost:3000');
}

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
