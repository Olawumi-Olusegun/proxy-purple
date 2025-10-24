import { CreateCouponSchema } from "../validators/coupon.schema";

export const calculateDiscount = (
  coupon: CreateCouponSchema,
  totalAmount: number
): number => {
  let discount = 0;

  if (totalAmount < (coupon.minOrderAmount || 0)) {
    throw new Error(
      `Minimum order amount of ${coupon.minOrderAmount} required`
    );
  }

  if (coupon?.discountType && coupon.discountType === "percentage") {
    discount = (totalAmount * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = coupon.discountValue;
  }

  // Ensure discount doesn't exceed total amount
  return Math.min(discount, totalAmount);
};

export const validateCoupon = (coupon: CreateCouponSchema): boolean => {
  const now = new Date();

  if (!coupon.isActive) {
    throw new Error("Coupon is not active");
  }

  if (coupon?.validFrom && coupon.validFrom > now) {
    throw new Error("Coupon is not yet valid");
  }

  if (coupon?.validUntil && coupon.validUntil < now) {
    throw new Error("Coupon has expired");
  }

  if (coupon?.usedCount && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit exceeded");
  }

  return true;
};
