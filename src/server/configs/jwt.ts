if (!process.env['JWT_SECRET']) {
  throw new Error('JWT_SECRET is not configured');
}

export const JWT_SECRET = process.env['JWT_SECRET'];
export const JWT_EXPIRES_IN = '15m';
