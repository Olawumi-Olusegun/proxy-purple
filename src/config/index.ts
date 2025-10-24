import dotenv from "dotenv";
dotenv.config();
export default {
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI || "",
  jwt: {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",

    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "1h",
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",
  },
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  APP_URL: process.env.APP_URL || "http://localhost:4000",
  email: {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_SERVICE: process.env.SMTP_SERVICE,
    SMTP_PORT: Number(process.env.SMTP_PORT || 587),
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
  },
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  RESEND_EMAIL_API_KEY: process.env.RESEND_EMAIL_API_KEY,
  IS_DEVELOPMENT: process.env.NODE_ENV !== "production",
};
