import { Schema, model, Document, Types } from "mongoose";

export interface IAuthToken extends Document {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
}

const AuthTokenSchema = new Schema<IAuthToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const AuthToken = model<IAuthToken>("AuthToken", AuthTokenSchema);
