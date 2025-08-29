import { ValidatorProps } from 'mongoose';

const dueDateValidator = {
  validator: function (this: any, value: Date): boolean {
    if (!value) return true;
    if (!this.debtDate) return true;

    return value >= this.debtDate;
  },
  message: (props: ValidatorProps) =>
    `Due date (${props.value}) must be equal to or after the debt date.`,
};

export default dueDateValidator;
