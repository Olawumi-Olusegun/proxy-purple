import { NextFunction, Request, Response } from "express";
import { CouponService } from "../services/coupon-service/coupon-service";

const couponService = new CouponService();

export const applyCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, orderAmount } = req.body;
    const result = await couponService.applyCoupon(code, orderAmount);
    res.json({ success: true, result });
  } catch (err) {
    next(err);
  }
};

export const CreateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const coupon = await couponService.createCoupon(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
};

export const getAllCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const coupons = await couponService.getAllCoupons();
    res.status(200).json({ success: true, coupons });
  } catch (err) {
    next(err);
  }
};

export const DeleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const coupons = await couponService.deleteCoupon(req.params.id);
    res.status(200).json({ success: true, coupons });
  } catch (err) {
    next(err);
  }
};

export const UpdateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updated = await couponService.updateCoupon(req.params.id, req.body);
    res.json({ success: true, coupon: updated });
  } catch (err) {
    next(err);
  }
};
