import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware";
import apiRoutes from "./routes";
import rateLimiter from "./middlewares/rate-limit.middleware";
import cron from "node-cron";
import axios from "axios";
import config from "./config";
import { gracefulShutdown } from "./database/dbConnection";

process.on("uncaughtException", (err: Error) =>
  gracefulShutdown(err, "uncaughtException")
);

process.on("unhandledRejection", (reason) => {
  const error =
    reason instanceof Error ? reason : new Error(JSON.stringify(reason));
  gracefulShutdown(error, "unhandledRejection");
});

const app = express();

app.disable("x-powered-by");
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(rateLimiter.globalLimiter);
app.get("/health", async (_req, res) => {
  return res.json({ ok: true });
});
app.use("/api", apiRoutes);

// 404 handler for undefined API routes
app.use((_req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Global error handler
app.use(errorMiddleware);

// CRON JOB — runs every 4 minutes
// This cron job is setup in other to bypass the idle time when deployed on render free hosting
cron.schedule("*/4 * * * *", async () => {
  try {
    const response = await axios.get(`${config.APP_URL}/health`);
    console.log(
      `[CRON] Health check successful at ${new Date().toISOString()}`,
      response.data
    );
    //eslint-disable-next-line
  } catch (error: any) {
    console.error(
      `[CRON] Health check failed at ${new Date().toISOString()}:`,
      error.message
    );
  }
});

export default app;
