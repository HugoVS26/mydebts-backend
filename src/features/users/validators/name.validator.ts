import { ValidatorProps } from 'mongoose';

const nameValidator = {
  validator: (v: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-']+$/;
    return nameRegex.test(v);
  },
  message: (props: ValidatorProps) =>
    `${props.value} is not a valid name. Only letters (including accented characters), spaces, hyphens, and apostrophes are allowed.`,
};

export default nameValidator;
