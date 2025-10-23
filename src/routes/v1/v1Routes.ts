import express from "express";
import { validate } from "../../middlewares/validate.middleware";
import {
  signinSchema,
  signupSchema,
  verifyOTPSchema,
} from "../../validators/auth.validators";
import * as authController from "../../controllers/auth.controller";

const v1Routes = express.Router();

//Authentication
v1Routes.post("/signup", validate(signupSchema), authController.signup);
v1Routes.post("/signin", validate(signinSchema), authController.signin);
v1Routes.post(
  "/verify-signup-otp",
  validate(verifyOTPSchema),
  authController.verifyOTP
);
v1Routes.post("/signout", authController.signout);

v1Routes.post("/forgot-password", authController.forgotPassword);
v1Routes.post(
  "/verify-forgot-password-otp",
  authController.verifyForgotPasswordOTP
);

v1Routes.post("/reset-password", authController.resetPassword);

export default v1Routes;
