import rateLimit, { Options } from "express-rate-limit";
import { AuthRequest } from "../types/type";
/**
 * Basic reusable Rate limit
 * Each route can define its own rate limit settings.
 */

export const createRateLimiter = (options?: Partial<Options>) =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // default 15 minutes
    max: 10, // default 10 requests per window
    message: {
      error: "Too many requests, please try again later.",
    },
    standardHeaders: true, // Return RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    ...options, // Override defaults
  });

// Specific limiters
export const signinLimiter = createRateLimiter({
  limit: 5,
  message: { error: "Too many login attempts, please try again later." },
});

export const signupLimiter = createRateLimiter({
  limit: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: { error: "Too many signup attempts, please try again later." },
});

export const forgotPasswordLimiter = createRateLimiter({
  limit: 3,
  windowMs: 30 * 60 * 1000, // 30 min
  message: {
    error: "Too many password reset attempts, please try again later.",
  },
});

// Global rate limiter
export const globalLimiter = createRateLimiter({
  max: (req: AuthRequest) => (req.user ? 1000 : 100),
  message: "Too many requests from this IP, please try again later",
  legacyHeaders: true,
  keyGenerator: (req: AuthRequest | undefined) =>
    req?.ip || req?.socket?.remoteAddress || "unknown",
});

const rateLimiter = {
  createRateLimiter,
  signinLimiter,
  signupLimiter,
  forgotPasswordLimiter,
  globalLimiter,
};

export default rateLimiter;
