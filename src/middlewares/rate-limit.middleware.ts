import rateLimit, { Options } from "express-rate-limit";

/**
 * Basic reusable Rate limit
 * Each route can define its own rate limit settings.
 */
export const createRateLimiter = (options?: Partial<Options>) =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // default: 10 requests per 15 minutes per IP
    message: {
      error: "Too many requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
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
