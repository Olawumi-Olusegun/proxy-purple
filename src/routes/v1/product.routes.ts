import express from "express";
import * as productsController from "../../controllers/product.controller";
import { isAuthenticated, authorize } from "../../middlewares/auth.middleware";

const router = express.Router();

router.use(isAuthenticated, authorize("admin"));
router.post("/create", productsController.createProduct);
router.get("/get-all", productsController.getProducts);
router.get("/get-product/:productId", productsController.getProduct);
router.patch("/update-product/:productId", productsController.updateProduct);
router.delete("/delete-product/:productId", productsController.deleteProduct);
export default router;
