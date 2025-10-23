import { Schema, model, Document, Types } from "mongoose";

export interface IResetPasswordToken extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResetPasswordTokenSchema = new Schema<IResetPasswordToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: auto-remove expired tokens
ResetPasswordTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ResetPasswordToken = model<IResetPasswordToken>(
  "ResetPasswordToken",
  ResetPasswordTokenSchema
);
