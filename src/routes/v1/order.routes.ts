import express from "express";
import * as orderController from "../../controllers/order.controller";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";

const router = express.Router();
router.use(authMiddleware);

router.post("/create", authorize("admin"), orderController.createOrder);
router.get("/get-all", authorize("admin", "user"), orderController.getOrders);
router.get(
  "/get-order/:orderId",
  authorize("admin", "user"),
  orderController.getOrder
);
router.patch(
  "/update-order/:orderId",
  authorize("admin"),
  orderController.updateOrderStatus
);
router.delete(
  "/delete-order/:orderId",
  authorize("admin"),
  orderController.deleteOrder
);

export default router;
