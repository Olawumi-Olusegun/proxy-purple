import express from "express";
import { authorize, isAuthenticated } from "../../middlewares/auth.middleware";
import * as usersController from "../../controllers/users.controller";
import { validateData } from "../../middlewares/validate.middleware";
import {
  ForgotPasswordSchema,
  SigninSchema,
  SignupSchema,
  VerifyOTPSchema,
} from "../../validators/auth.validators";
import * as authController from "../../controllers/auth.controller";
import passport from "passport";

const router = express.Router();

router.get("/", isAuthenticated, authorize("admin"), usersController.getUsers);
//Authentication
// /api/v1/auth/

router.post(
  "/signup",
  validateData({ body: SignupSchema }),
  authController.signup
);

router.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/api/v1/users/profile",
    failureRedirect: "/api/v1/auth/auth-failure",
  }),
  validateData({ body: SigninSchema }),
  authController.signin
);

router.post(
  "/verify-signup-otp",
  validateData({ body: VerifyOTPSchema }),
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
  isAuthenticated,
  authorize("admin", "user"),
  usersController.myProfile
);

router.post(
  "/resend-otp",
  validateData({ body: ForgotPasswordSchema }),
  authController.resendOTP
);

router.get("/auth-failure", authController.authFailureRedirect);

export default router;
