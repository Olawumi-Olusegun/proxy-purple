import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().default("4000").transform(Number),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_ACCESS_EXPIRES: z.string().default("1h"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),

  CLIENT_URL: z.url().default("http://localhost:5173"),
  APP_URL: z.url().default("http://localhost:4000"),
  BASE_PROXY_URL: z.url().min(1, { message: "BASE_PROXY_URL is required" }),
  SERVICE_KEY: z.string().min(1, { message: "Service key is required" }),

  SMTP_HOST: z.string().optional(),
  SMTP_SERVICE: z.string().optional(),
  SMTP_PORT: z.string().default("587").transform(Number),
  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  RESEND_EMAIL_API_KEY: z.string().optional(),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});
