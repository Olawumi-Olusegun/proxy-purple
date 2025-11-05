import express from "express";
import * as couponController from "../../controllers/coupon.controller";
import { validateData } from "../../middlewares/validate.middleware";
import { isAuthenticated, authorize } from "../../middlewares/auth.middleware";
import {
  CreateCouponSchema,
  UpdateCouponSchema,
} from "../../validators/coupon.schema";

const router = express.Router();

// Admin only for coupon operations
// /api/v1/coupons/
router.use(isAuthenticated, authorize("admin"));

router
  .route("/")
  .post(
    validateData({ body: CreateCouponSchema }),
    couponController.createCoupon
  )
  .get(couponController.getCoupons);

router
  .route("/:couponId")
  .patch(
    validateData({ body: UpdateCouponSchema }),
    couponController.updateCoupon
  )
  .delete(couponController.deleteCoupon);

//
router.post(
  "/validate-coupon",
  validateData({ body: CreateCouponSchema }),
  couponController.validateCouponCode
);

export default router;
