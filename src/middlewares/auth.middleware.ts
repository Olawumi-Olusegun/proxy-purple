import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../services/jwt.service";
import config from "../config";
import { AuthToken } from "../models/auth-token.model";
import {
  CreateAndSaveAuthTokenToDatabase,
  verifyJwtToken,
} from "../utils/auth-token-utils";
import { User } from "../models/user.model";
import { AuthRequest } from "../types/type";

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};

const ACCESS_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 1000 * 60 * 60, // 1hr
};

// Inactive: AuthMiddleware for Token based authentication
export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;
    if (!header)
      return res.status(401).json({ error: "No authorization header" });
    const token = header.split(" ")[1];
    const { userId, email, role } = verifyAccessToken(token) as jwt.JwtPayload &
      AuthRequest["user"];

    if (!userId || !email || !role) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // attach payload to request
    req.user = {
      email,
      role,
      userId,
    };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Active: Auth Middleware in use
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies?.accessToken;
  if (!accessToken) {
    return handleRefresh(req, res, next); // fallback to refresh token
  }

  try {
    const payload = verifyJwtToken(
      accessToken,
      "accessToken",
      config.jwt.JWT_ACCESS_SECRET
    );

    // Check if payload is valid
    if (!payload.email || !payload.userId) {
      return handleRefresh(req, res, next);
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return handleRefresh(req, res, next);
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as string,
    };

    return next();
  } catch {
    return handleRefresh(req, res, next);
  }
};

// Refresh authToken (accessToken and refreshToken) if invalid
const handleRefresh = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Get refreshToken from cookie header
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Missing refresh token" });
  }

  try {
    const payload = verifyJwtToken(
      refreshToken,
      "refreshToken",
      config.jwt.JWT_REFRESH_SECRET
    );

    // CHeck if payload is valid
    if (!payload.userId || !payload.email) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Check refresh token exists in Database
    const tokenExist = await AuthToken.findOne({
      userId: payload.userId,
      refreshToken,
    });

    // Return if no token
    if (!tokenExist) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Return if token in the database does not match the cookie token
    if (tokenExist.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Implement token Rotation: Issue new access token
    // Generate new token and save to the database. First Generate token, then save generated token to database
    const token = await CreateAndSaveAuthTokenToDatabase(
      payload.userId,
      payload.email
    );

    const user = await User.findById(payload.userId);

    if (!user) {
      return res.status(403).json({ message: "Unauthorized", success: false });
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as string,
    };
    // Add the new token to header cookie
    res.cookie("accessToken", token.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

    res.cookie(
      "refreshToken",
      token.refreshToken,
      REFRESH_TOKEN_COOKIE_OPTIONS
    );

    return next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return handleRefresh(req, res, next);
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return handleRefresh(req, res, next);
    }
    return res
      .status(401)
      .json({ message: "Refresh token expired/invalid", success: false });
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res
        .status(403)
        .json({ message: "Not authorized", success: false });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Unauthorized", success: false });
    }
    next();
  };
};
