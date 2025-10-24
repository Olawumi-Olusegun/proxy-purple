import express from "express";
import * as usersController from "../../controllers/users.controller";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";

const router = express.Router();

// /api/v1/users/
router.get(
  "/",
  authMiddleware,
  authorize("admin", "user"),
  usersController.getUsers
);

router
  .get(
    "/profile",
    authMiddleware,
    authorize("admin", "user"),
    usersController.myProfile
  )
  .put(
    "/profile/update",
    authMiddleware,
    authorize("admin", "user"),
    usersController.UpdateMyProfile
  );

export default router;
