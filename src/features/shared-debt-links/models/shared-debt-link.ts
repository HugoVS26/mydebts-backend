import mongoose, { Schema } from 'mongoose';
import { ISharedDebtLink } from '../types/shared-debt-link.js';

const EXPIRY_HOURS = 48;

const SharedDebtLinkSchema = new Schema<ISharedDebtLink>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    debtSnapshot: {
      type: Schema.Types.Mixed,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model<ISharedDebtLink>('SharedDebtLink', SharedDebtLinkSchema);
