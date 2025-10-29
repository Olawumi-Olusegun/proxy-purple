import express from "express";
import userRoutes from "./users.routes";
import authRoutes from "./auth.routes";
import couponRoutes from "./coupon.routes";
import adminRoutes from "./admin.routes";
import productRoutes from "./product.routes";
import ordersRoutes from "./order.routes";
import serverRoutes from "./server.routes";

const router = express.Router();

// Grouping routes by modules
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/coupons", couponRoutes);
router.use("/admin", adminRoutes);
router.use("/products", productRoutes);
router.use("/orders", ordersRoutes);
router.use("/servers", serverRoutes);

export default router;
