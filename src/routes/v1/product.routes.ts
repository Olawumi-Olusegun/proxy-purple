import express from "express";
import * as productsController from "../../controllers/product.controller";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";

const router = express.Router();

router.use(authMiddleware, authorize("admin"));
router.post("/create", productsController.createProduct);
router.get("/get-all", productsController.getProducts);
router.get("/get-product/:productId", productsController.getProduct);
router.patch("/update-product/:productId", productsController.updateProduct);
router.delete("/delete-product/:productId", productsController.deleteProduct);

export default router;
