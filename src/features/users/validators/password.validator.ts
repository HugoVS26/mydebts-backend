import { ValidatorProps } from 'mongoose';

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

const passwordValidator = {
  validator: (value: string): boolean => strongPasswordRegex.test(value),
  message: (props: ValidatorProps) =>
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
};

export default passwordValidator;
