import express from "express";
import * as usersController from "../../controllers/users.controller";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";

const router = express.Router();
// router.get("/", authMiddleware, authorize("admin"), usersController.getUsers);

// /api/v1/users/
router
  .route("/")
  .get(authMiddleware, authorize("admin"), usersController.getUsers)
  .patch(authMiddleware, authorize("admin"), usersController.getUsers);

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
