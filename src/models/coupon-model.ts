import { Schema, model, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountType: "percentage" | "fixed";
  discountAmount: number;
  minPurchase: number;
  expirationDate: Date;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
}

const couponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    required: true,
  },
  discountAmount: { type: Number, required: true },
  minPurchase: { type: Number, default: 0 },
  expirationDate: { type: Date, required: true },
  usageLimit: { type: Number, default: 1 },
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const CouponModel = model<ICoupon>("Coupon", couponSchema);
export default CouponModel;
