import express from "express";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";
import * as usersController from "../../controllers/users.controller";
import {
  validateData,
  ValidationSource,
} from "../../middlewares/validate.middleware";
import {
  SigninSchema,
  SignupSchema,
  VerifyOTPSchema,
} from "../../validators/auth.validators";
import * as authController from "../../controllers/auth.controller";

const router = express.Router();

router.get("/", authMiddleware, authorize("admin"), usersController.getUsers);
//Authentication
// /api/v1/auth/
router.post(
  "/signup",
  validateData(SignupSchema, ValidationSource.BODY),
  authController.signup
);

router.post(
  "/signin",
  validateData(SigninSchema, ValidationSource.BODY),
  authController.signin
);

router.post(
  "/verify-signup-otp",
  validateData(VerifyOTPSchema, ValidationSource.BODY),
  authController.verifyOTP
);

router.post("/signout", authController.signout);

router.post("/forgot-password", authController.forgotPassword);
router.post(
  "/verify-forgot-password-otp",
  authController.verifyForgotPasswordOTP
);

router.post("/reset-password", authController.resetPassword);

router.get(
  "/profile",
  authMiddleware,
  authorize("admin", "user"),
  usersController.myProfile
);

export default router;
