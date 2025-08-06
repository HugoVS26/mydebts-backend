import { ValidatorProps } from 'mongoose';

const displayNameValidator = {
  validator: (v?: string): boolean => {
    if (!v) return true;
    const displayNameRegex = /^[a-zA-Z0-9_\s\-']+$/;
    return displayNameRegex.test(v);
  },
  message: (props: ValidatorProps) =>
    `${props.value} is not a valid display name. Only letters, numbers, underscores, spaces, hyphens, and apostrophes are allowed.`,
};

export default displayNameValidator;
