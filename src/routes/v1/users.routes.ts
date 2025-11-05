import express from "express";
import * as usersController from "../../controllers/users.controller";
import { isAuthenticated, authorize } from "../../middlewares/auth.middleware";

const router = express.Router();
// router.get("/", isAuthenticated, authorize("admin"), usersController.getUsers);

// /api/v1/users/
router
  .route("/")
  .get(isAuthenticated, authorize("admin"), usersController.getUsers)
  .patch(isAuthenticated, authorize("admin"), usersController.getUsers);

router
  .get(
    "/profile",
    isAuthenticated,
    authorize("admin", "user"),
    usersController.myProfile
  )
  .put(
    "/profile/update",
    isAuthenticated,
    authorize("admin", "user"),
    usersController.UpdateMyProfile
  );

export default router;
