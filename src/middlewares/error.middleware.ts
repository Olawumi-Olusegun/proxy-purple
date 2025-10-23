import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/http-error";

export default function errorMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Fallback for unhandled errors
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
}
