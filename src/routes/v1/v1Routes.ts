import express from "express";
import { validateData } from "../../middlewares/validate.middleware";
import {
  signinSchema,
  signupSchema,
  verifyOTPSchema,
} from "../../validators/auth.validators";
import * as authController from "../../controllers/auth.controller";
import * as adminController from "../../controllers/admin.controller";
import * as usersController from "../../controllers/users.controller";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";

const v1Routes = express.Router();

//Authentication
v1Routes.post("/signup", validateData(signupSchema), authController.signup);
v1Routes.post("/signin", validateData(signinSchema), authController.signin);
v1Routes.post(
  "/verify-signup-otp",
  validateData(verifyOTPSchema),
  authController.verifyOTP
);
v1Routes.post("/signout", authController.signout);

v1Routes.post("/forgot-password", authController.forgotPassword);
v1Routes.post(
  "/verify-forgot-password-otp",
  authController.verifyForgotPasswordOTP
);

v1Routes.post("/reset-password", authController.resetPassword);

v1Routes.get(
  "/users",
  authMiddleware,
  authorize("admin", "user"),
  usersController.getUsers
);

v1Routes
  .get(
    "/user/profile",
    authMiddleware,
    authorize("admin", "user"),
    usersController.myProfile
  )
  .put(
    "/user/profile/update",
    authMiddleware,
    authorize("admin", "user"),
    usersController.UpdateMyProfile
  );

// Admin Routes
v1Routes.get(
  "/admin",
  authMiddleware,
  authorize("admin"),
  adminController.getAdmin
);

export default v1Routes;
