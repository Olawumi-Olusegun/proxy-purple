import { NextFunction, Request, Response } from "express";
import { randomTokenString, hashToken } from "../utils/crypto.util";
import {
  sendResetPasswordEmail,
  sendResetPasswordOtp,
} from "../services/email.service";
import { User } from "../models/user.model";
import { AuthService } from "../services/auth-service/auth-service";
import { ResetPasswordToken } from "../models/reset-password.model";
import { generateAlphaNumericOTP } from "../utils/generateOTP";
import OtpModel from "../models/otp.model";

// Helper type for typed request bodies
type RequestWithBody<T> = Request & { body: T };

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};

const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 1000 * 60 * 60, // 1hr
};

const authService = new AuthService();

interface UserResponse {
  success: boolean;
  message?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    country: string;
    city: string;
    addressLine1: string;
    addressLine2: string;
    postalCode: string;
  };
}

function createUserResponse(user: any, message?: string): UserResponse {
  return {
    success: true,
    message: message ?? "",
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phoneNumber: user.phoneNumber ?? "",
      country: user.country ?? "",
      city: user.city ?? "",
      addressLine1: user.addressLine1 ?? "",
      addressLine2: user.addressLine2 ?? "",
      postalCode: user.postalCode ?? "",
    },
  };
}

/* ============ GOOGLE AUTH ============ */
export async function googleAuth(
  req: RequestWithBody<{ idToken: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "No Google ID token" });
    }

    const user = await authService.googleAuth(idToken);

    res.cookie("refreshToken", user.refreshToken, COOKIE_OPTIONS);
    res.cookie("accessToken", user.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.status(201).json(createUserResponse(user.userExist));
  } catch (err) {
    next(err);
  }
}

export async function signup(
  req: RequestWithBody<{ email: string; password: string; name?: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;

    const user = (await authService.signup(email, password)) as {
      newUser: any;
      accessToken: string;
      refreshToken: string;
    };

    res.cookie("refreshToken", user.refreshToken, COOKIE_OPTIONS);
    res.cookie("accessToken", user.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.status(201).json({
      message: "User created successfully, an OTP has been sent to your email",
      success: true,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyOTP(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, otp } = req.body;

    const { user, accessToken, refreshToken } = await authService.verifyOtp(
      email,
      otp
    );

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.status(200).json(createUserResponse(user));
  } catch (err: any) {
    next(err);
  }
}

export async function signin(
  req: RequestWithBody<{ email: string; password: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;

    const user = await authService.signin(email, password);

    res.cookie("refreshToken", user.refreshToken, COOKIE_OPTIONS);
    res.cookie("accessToken", user.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.status(200).json(createUserResponse(user.userExist));
  } catch (err) {
    next(err);
  }
}

/* ============ SIGN OUT ============ */
export async function signout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const result = await authService.signout(token);
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });
    res.clearCookie("accessToken", { httpOnly: true, sameSite: "strict" });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    const { refreshToken, accessToken } = await authService.refreshToken(token);

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    next(err);
  }
}

export async function verifyLogin(req: Request, res: Response) {
  const user = (req as any).user;
  res.json({ ok: true, user });
}

export async function forgotPassword(
  req: RequestWithBody<{ email: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    await OtpModel.deleteMany({ email });

    const otpCode = generateAlphaNumericOTP();

    await OtpModel.create({
      email,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
    });

    try {
      await sendResetPasswordOtp(email, otpCode);
    } catch (emailErr) {
      console.error("Failed to send reset email", emailErr);
    }

    res.json({
      success: true,
      message: "A password reset OTP has been sent to your email",
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyForgotPasswordOTP(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, otp } = req.body;

    await authService.verifyForgotPasswordOtp(email, otp);

    res.status(200).json({ success: true, message: "OTP verified" });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(
  req: RequestWithBody<{ otp: string; newPassword: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const { otp, newPassword, email } = req.body;
    const { user, accessToken, refreshToken } = await authService.resetPassword(
      email,
      otp,
      newPassword
    );
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    res.cookie("accessToken", accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
    res.status(200).json(createUserResponse(user, "Password reset successful"));
  } catch (err) {
    next(err);
  }
}
