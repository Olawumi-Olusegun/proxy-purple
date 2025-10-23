import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  isValid(enteredOtp: string): Promise<boolean>;
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash OTP before saving (so it’s not stored in plain text)
otpSchema.pre("save", async function (next) {
  if (!this.isModified("otp")) return next();
  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(this.otp, salt);
  next();
});

// Helper method to compare OTP
otpSchema.methods.isValid = async function (
  enteredOtp: string
): Promise<boolean> {
  return await bcrypt.compare(enteredOtp, this.otp);
};

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpModel = mongoose.model<IOtp>("Otp", otpSchema);

export default OtpModel;
