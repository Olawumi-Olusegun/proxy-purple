import mongoose, { Schema } from "mongoose";
import { CreateCouponSchema } from "../validators/coupon.schema";

const couponSchema = new Schema<CreateCouponSchema>(
  {
    code: {
      type: String,
      required: [true, "Please provide a coupon code"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "Please provide discount type"],
    },
    discountValue: {
      type: Number,
      required: [true, "Please provide discount value"],
      min: [0, "Discount value cannot be negative"],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative"],
    },
    maxDiscountAmount: {
      type: Number,
      min: [0, "Maximum discount amount cannot be negative"],
    },
    validFrom: {
      type: Date,
    },
    validUntil: {
      type: Date,
    },
    expiryDate: {
      type: Date,
      required: [true, "Please provide expiry date"],
    },
    usageLimit: {
      type: Number,
      required: [true, "Please provide usage limit"],
      min: [1, "Usage limit must be at least 1"],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Expired", "Suspended"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ code: 1, isActive: 1 });

const CouponModel = mongoose.model<CreateCouponSchema>("Coupon", couponSchema);
export default CouponModel;
