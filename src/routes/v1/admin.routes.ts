import express from "express";
import * as usersController from "../../controllers/users.controller";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";

const router = express.Router();

router.use(authMiddleware, authorize("admin"));
router.get("/get-users", usersController.getUsers);
router.delete("/delete-user/:userId", usersController.deleteUser);

export default router;
