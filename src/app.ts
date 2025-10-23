import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware";
import apiRoutes from "./routes";
import { createRateLimiter } from "./middlewares/rate-limit.middleware";
import cron from "node-cron";
import axios from "axios";
import config from "./config";

const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const globalLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 100, // 100 req/min per IP
});

app.use(globalLimiter);
app.get("/health", async (_req, res) => {
  return res.json({ ok: true });
});
app.use("/api", apiRoutes);

app.use(errorMiddleware);

// CRON JOB — runs every 4 minutes
// This cron job is setup in other to bypass the idle time when deployed on render free hosting
cron.schedule("*/4 * * * *", async () => {
  try {
    const response = await axios.get(`${config.appUrl}/health`);
    console.log(
      `[CRON] Health check successful at ${new Date().toISOString()}`,
      response.data
    );
  } catch (error: any) {
    console.error(
      `[CRON] Health check failed at ${new Date().toISOString()}:`,
      error.message
    );
  }
});

export default app;
