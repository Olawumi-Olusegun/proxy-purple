import dotenv from "dotenv";
dotenv.config();
export default {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI || "",
  jwt: {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",

    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "1h",
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",
  },
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  appUrl: process.env.APP_URL || "http://localhost:4000",
  email: {
    host: process.env.SMTP_HOST,
    service: process.env.SMTP_SERVICE,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  resendEmailApiKey: process.env.RESEND_EMAIL_API_KEY,
  isDevelopment: process.env.NODE_ENV !== "production",
};
