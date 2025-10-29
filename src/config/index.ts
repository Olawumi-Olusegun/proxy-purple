import { envSchema } from "./envSchema";
import dotenv from "dotenv";

dotenv.config();

export const env = envSchema.parse(process.env);

export default {
  PORT: env.PORT,
  MONGO_URI: env.MONGO_URI,
  jwt: {
    JWT_ACCESS_SECRET: env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: env.JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRES: env.JWT_ACCESS_EXPIRES,
    JWT_REFRESH_EXPIRES: env.JWT_REFRESH_EXPIRES,
  },
  CLIENT_URL: env.CLIENT_URL,
  APP_URL: env.APP_URL,
  BASE_PROXY_URL: env.BASE_PROXY_URL,
  SERVICE_KEY: env.SERVICE_KEY,
  email: {
    SMTP_HOST: env.SMTP_HOST,
    SMTP_SERVICE: env.SMTP_SERVICE,
    SMTP_PORT: env.SMTP_PORT,
    EMAIL_USER: env.EMAIL_USER,
    EMAIL_PASS: env.EMAIL_PASS,
  },
  GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
  RESEND_EMAIL_API_KEY: env.RESEND_EMAIL_API_KEY,
  IS_DEVELOPMENT: env.NODE_ENV !== "production",
};
