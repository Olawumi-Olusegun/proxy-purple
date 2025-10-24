import { NextFunction, Request, Response } from "express";
import CouponService from "../services/coupon-service/coupon-service";

const couponService = new CouponService();

export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit,
      isActive,
      expiryDate,
    } = req.body;

    const coupon = await couponService.createCoupon({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit,
      isActive,
      expiryDate,
      usedCount: 0,
      status: "Active",
    });

    res.status(201).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const validateCouponCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, totalAmount } = req.body;

    const coupon = await couponService.findCouponByCode(code);

    const data = couponService.applyDiscount(coupon, totalAmount);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCoupons = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const coupons = await couponService.getCoupons();

    res.json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const coupon = await couponService.updateCoupon(
      req.params.couponId,
      req.body
    );

    res.json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await couponService.deleteCoupon(req.params.couponId);

    res.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
