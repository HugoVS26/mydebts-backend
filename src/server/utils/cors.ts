const frontUrl = process.env.FRONT_URL!;
export const corsOptions = {
  origin: [
    frontUrl,
    'http://localhost:5173',
    'http://localhost:4000',
    'http://localhost:3000',
  ],
};
