import { ValidatorProps } from 'mongoose';
import validator from 'validator';

const { isEmail } = validator;

const emailValidator = {
  validator: (value: string): boolean => isEmail(value),
  message: (props: ValidatorProps) => `${props.value} is not a valid email address.`,
};

export default emailValidator;
