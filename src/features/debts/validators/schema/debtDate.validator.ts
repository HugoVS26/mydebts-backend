import { ValidatorProps } from 'mongoose';

const debtDateValidator = {
  validator: (value: Date): boolean => {
    if (!value) return false;
    const now = new Date();
    return value <= now;
  },
  message: (props: ValidatorProps) =>
    `${props.value} is not a valid debt date. It cannot be in the future.`,
};

export default debtDateValidator;
