import { ValidatorProps } from 'mongoose';

const debtorCreditorDistinctValidator = {
  validator: function (this: any): boolean {
    if (!this.debtor || !this.creditor) return true;

    const debtorStr = this.debtor.toString().trim().toLowerCase();
    const creditorStr = this.creditor.toString().trim().toLowerCase();

    return debtorStr !== creditorStr;
  },
  message: (props: ValidatorProps) => 'Debtor and creditor must be different.',
};

export default debtorCreditorDistinctValidator;
