import express from "express";
import userRoutes from "./users.routes";
import authRoutes from "./auth.routes";
import couponRoutes from "./coupon.routes";

const router = express.Router();

// Grouping routes by modules
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/coupons", couponRoutes);

export default router;
