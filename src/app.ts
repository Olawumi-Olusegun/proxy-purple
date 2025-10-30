import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware";
import apiRoutes from "./routes";
import rateLimiter from "./middlewares/rate-limit.middleware";
import { gracefulShutdown } from "./database/dbConnection";

process.on("uncaughtException", (err: Error) => {
  return gracefulShutdown(err, "uncaughtException");
});

process.on("unhandledRejection", (reason) => {
  const errorMessage =
    reason instanceof Error ? reason : new Error(JSON.stringify(reason));
  gracefulShutdown(errorMessage, "unhandledRejection");
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

app.get("/health", async (_req, res) => {
  return res.json({ ok: true });
});

app.use(rateLimiter.globalLimiter);
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
export default app;
