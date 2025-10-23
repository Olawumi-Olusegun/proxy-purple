import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  email: string;
  password?: string | null;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  googleId?: string | null;
  isVerified?: boolean;
  role?: "user" | "admin";
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    phoneNumber: { type: String },
    country: { type: String },
    city: { type: String },
    addressLine1: { type: String },
    addressLine2: { type: String },
    postalCode: { type: String },
    googleId: { type: String },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  const user = this as IUser;
  if (user.isModified("password") && user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});

UserSchema.methods.comparePassword = function (plainPassword: string) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(plainPassword, this.password);
};

export const User = model<IUser>("User", UserSchema);
