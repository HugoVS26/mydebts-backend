import { ValidatorProps } from 'mongoose';

const debtorCreditorDistinctValidator = {
  validator: function (this: any): boolean {
    if (!this.debtor || !this.creditor) return true;
    return this.debtor.toString() !== this.creditor.toString();
  },
  message: (props: ValidatorProps) =>
    'Debtor and creditor must be different users.',
};

export default debtorCreditorDistinctValidator;
