import { Schema, model, Document, Types } from "mongoose";

export interface IAuthToken extends Document {
  userId: Types.ObjectId;
  refreshToken: string;
  accessToken?: string;
  expiresAt: Date;
}

const AuthTokenSchema = new Schema<IAuthToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    refreshToken: { type: String, required: true },
    accessToken: { type: String },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const AuthToken = model<IAuthToken>("AuthToken", AuthTokenSchema);
