import CouponModel from "../../models/coupon-model";
import { calculateDiscount, validateCoupon } from "../../utils/coupon-utils";
import { HttpError } from "../../utils/http-error";
import {
  CreateCouponSchemaType,
  UpdateCouponSchemaType,
} from "../../validators/coupon.schema";

class CouponService {
  async createCoupon(data: CreateCouponSchemaType) {
    const existingCoupon = await CouponModel.findOne({
      code: data.code,
      isActive: true,
    });

    if (existingCoupon) {
      throw new HttpError("Coupon with this code already exists", 400);
    }

    const coupon = await CouponModel.create(data);

    if (!coupon) {
      throw new HttpError("Failed to create coupon", 400);
    }

    return coupon;
  }

  async findCouponByCode(code: string) {
    const coupon = await CouponModel.findOne({ code, isActive: true });
    if (!coupon) {
      throw new HttpError("Invalid coupon code", 400);
    }
    return coupon;
  }

  async getCoupons() {
    const coupon = await CouponModel.find().sort({ createdAt: -1 });
    if (!coupon) {
      throw new HttpError("Failed to create coupon", 404);
    }

    return coupon;
  }

  async updateCoupon(couponId: string, data: UpdateCouponSchemaType) {
    if (!couponId) {
      throw new HttpError("Coupon id is required", 400);
    }

    if (data.code) {
      throw new HttpError("Coupon code cannot be updated", 400);
    }

    const updatedCoupon = await CouponModel.findByIdAndUpdate(couponId, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedCoupon) {
      throw new HttpError("Coupon not found", 400);
    }

    return updatedCoupon;
  }

  async deleteCoupon(couponId: string) {
    if (!couponId) {
      throw new HttpError("Coupon id is required", 400);
    }

    return await CouponModel.findByIdAndDelete(couponId);
  }

  applyDiscount(coupon: CreateCouponSchemaType, totalAmount: number) {
    validateCoupon(coupon);
    const discountAmount = calculateDiscount(coupon, totalAmount);
    const finalAmount = totalAmount - discountAmount;
    return {
      coupon,
      discountAmount,
      finalAmount,
    };
  }
}

export default CouponService;
