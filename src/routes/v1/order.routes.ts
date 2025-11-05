import express from "express";
import * as orderController from "../../controllers/order.controller";
import { isAuthenticated, authorize } from "../../middlewares/auth.middleware";
import { validateData } from "../../middlewares/validate.middleware";
import { CreateOrderSchemaWithCouponCode } from "../../validators/order.validators";

const router = express.Router();
router.use(isAuthenticated);

router.post(
  "/create",
  validateData({ body: CreateOrderSchemaWithCouponCode }),
  authorize("admin", "user"),
  orderController.createOrder
);
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
