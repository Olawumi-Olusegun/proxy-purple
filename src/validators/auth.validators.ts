import { z } from "zod";

const MailSchema = z.email("Invalid email address");

const SignupSchema = z.object({
  email: MailSchema,
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).optional(),
});

const VerifyOTPSchema = z.object({
  email: MailSchema,
  otp: z.string({ error: "OTP is required" }).min(6).max(6),
});

const SigninSchema = z.object({
  email: MailSchema,
  password: z
    .string({ message: "Password is required" })
    .min(1, { message: "Password is required" }),
});

const ForgotPasswordSchema = z.object({
  email: MailSchema,
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

const GoogleSchema = z.object({
  idToken: z.string().min(1, { message: "Token is required" }),
});

type SignupSchema = z.infer<typeof SignupSchema>;
type VerifyOTPSchema = z.infer<typeof VerifyOTPSchema>;
type SigninSchema = z.infer<typeof SigninSchema>;
type ForgotPasswordSchema = z.infer<typeof ForgotPasswordSchema>;
type ResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;
type GoogleSchema = z.infer<typeof GoogleSchema>;

export {
  SignupSchema,
  VerifyOTPSchema,
  SigninSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  GoogleSchema,
};
