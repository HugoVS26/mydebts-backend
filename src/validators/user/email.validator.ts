import { isEmail } from 'validator';
import { ValidatorProps } from 'mongoose';

const emailValidator = {
  validator: (value: string): boolean => isEmail(value),
  message: (props: ValidatorProps) =>
    `${props.value} is not a valid email address.`,
};

export default emailValidator;
