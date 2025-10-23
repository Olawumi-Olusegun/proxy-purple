import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";
import { HttpError } from "../utils/http-error";

export default function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Known application error
  if (err instanceof HttpError) {
    logger.warn(err.message); // Not server-breaking, so warn not error
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unknown or system-level error
  logger.error("Unexpected error", {
    message: err.message,
    stack: err.stack,
    path: _req?.originalUrl,
    method: _req?.method,
  });

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}
