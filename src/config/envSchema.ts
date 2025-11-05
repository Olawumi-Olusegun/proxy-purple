import { z } from "zod";

const envSchema = z.object({
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

  GOOGLE_OAUTH_CLIENT_ID: z
    .string()
    .min(1, "Google auth ID is required")
    .nonempty(),
  GOOGLE_OAUTH_CLIENT_SECRET: z
    .string()
    .min(1, "Google auth secret is required")
    .nonempty(),
  GOOGLE_OAUTH_REDIRECT_URL: z
    .string()
    .min(1, "Google auth redirect url is required")
    .nonempty(),
  SESSION_SECRET: z
    .string()
    .min(1, "passport session secret is required")
    .nonempty(),

  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

type envSchema = z.infer<typeof envSchema>;

export { envSchema };
