import CouponModel from "../../models/coupon-model";
import couponModel, { ICoupon } from "../../models/coupon-model";
import { HttpError } from "../../utils/http-error";

export class CouponService {
  async applyCoupon(code: string, orderAmount: number) {
    const coupon = await couponModel.findOne({ code });

    if (!coupon) throw new Error("Invalid coupon code");

    if (coupon.expirationDate < new Date()) {
      throw new Error("Coupon expired");
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      throw new Error("Coupon usage limit reached");
    }

    if (orderAmount < coupon.minPurchase) {
      throw new Error(`Minimum order amount is ₦${coupon.minPurchase}`);
    }

    const discountAmount =
      coupon.discountType === "percentage"
        ? (coupon.discountAmount / 100) * orderAmount
        : coupon.discountAmount;

    const finalAmount = Math.max(orderAmount - discountAmount, 0);

    // Update coupon usage
    coupon.usedCount += 1;
    await coupon.save();

    return {
      success: true,
      finalAmount,
      discountAmount,
      coupon,
    };
  }

  async createCoupon(data: Partial<ICoupon>) {
    try {
      const coupon = await CouponModel.create(data);

      if (!coupon) {
        throw new HttpError("Failed to create coupon", 400);
      }

      return coupon;
    } catch (error) {
      throw new HttpError("Failed to create coupon", 500);
    }
  }

  async getAllCoupons(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      CouponModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      CouponModel.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      coupons,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async deleteCoupon(couponId: string) {
    try {
      if (!couponId) {
        throw new HttpError("Coupon ID is required", 404);
      }

      const coupon = await CouponModel.findByIdAndDelete(couponId);

      if (!coupon) {
        throw new HttpError("Coupon not found", 404);
      }

      return coupon;
    } catch (error) {
      throw new HttpError("Failed to delete coupon");
    }
  }

  async updateCoupon(couponId: string, data: Partial<ICoupon>) {
    if (!couponId) {
      throw new HttpError("Coupon ID is required", 404);
    }

    const updatedCoupon = await CouponModel.findByIdAndUpdate(couponId, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedCoupon) {
      throw new Error("Coupon not found");
    }

    return updatedCoupon;
  }
}

export default new CouponService();
