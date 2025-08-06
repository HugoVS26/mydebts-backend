import { ValidatorProps } from 'mongoose';

const nameValidator = {
  validator: (v: string): boolean => {
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    return nameRegex.test(v);
  },
  message: (props: ValidatorProps) =>
    `${props.value} is not a valid name. Only letters, spaces, hyphens, and apostrophes are allowed.`,
};

export default nameValidator;
