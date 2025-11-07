import express, { NextFunction, Request, Response } from "express";
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
  validateData({ body: SigninSchema }),
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false | null,
        info?: { message?: string }
      ) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({
            message: info?.message || "Invalid email or password",
          });
        }

        req.logIn(user, (loginErr: Error | null) => {
          if (loginErr) return next(loginErr);
          return authController.signin(req, res, next);
        });
      }
    )(req, res, next);
  }
);

router.post(
  "/verify-signup-otp",
  validateData({ body: VerifyOTPSchema }),
  authController.verifyOTP
);

router.post("/signout", (req: Request, res: Response, next: NextFunction) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res
        .status(200)
        .json({ message: "Logged out successfully", success: true });
    });
  });
});

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
