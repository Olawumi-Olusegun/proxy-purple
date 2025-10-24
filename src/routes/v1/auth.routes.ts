import express from "express";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";
import * as usersController from "../../controllers/users.controller";
import { validateData } from "../../middlewares/validate.middleware";
import {
  signinSchema,
  signupSchema,
  verifyOTPSchema,
} from "../../validators/auth.validators";
import * as authController from "../../controllers/auth.controller";

const router = express.Router();
//Authentication
// /api/v1/auth/
router.post("/signup", validateData(signupSchema), authController.signup);
router.post("/signin", validateData(signinSchema), authController.signin);
router.post(
  "/verify-signup-otp",
  validateData(verifyOTPSchema),
  authController.verifyOTP
);
router.post("/signout", authController.signout);

router.post("/forgot-password", authController.forgotPassword);
router.post(
  "/verify-forgot-password-otp",
  authController.verifyForgotPasswordOTP
);

router.post("/reset-password", authController.resetPassword);

router.get("/", authMiddleware, authorize("admin"), usersController.getUsers);
router.get(
  "/profile",
  authMiddleware,
  authorize("admin", "user"),
  usersController.myProfile
);

export default router;
