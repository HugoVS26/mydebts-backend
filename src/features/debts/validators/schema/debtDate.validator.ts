import { ValidatorProps } from 'mongoose';

export const debtDateValidator = (value?: Date): boolean => {
  if (!value) return true;
  const now = new Date();
  return value <= now;
};

export const debtDateValidatorMessage = (props: ValidatorProps) =>
  `${props.value} is not a valid debt date. It cannot be in the future.`;
