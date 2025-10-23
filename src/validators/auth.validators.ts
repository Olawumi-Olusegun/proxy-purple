import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    name: z.string().min(1).optional(),
  }),
});

export const verifyOTPSchema = z.object({
  body: z.object({
    email: z.email(),
    otp: z.string().min(6).max(6),
  }),
});

export const signinSchema = z.object({
  body: z.object({
    email: z.email(),
    password: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export const googleSchema = z.object({
  body: z.object({
    idToken: z.string().min(1),
  }),
});
