import config from "../config";
import { StringValue } from "ms";
import jwt from "jsonwebtoken";
import { AuthToken } from "../models/auth-token.model";
import { HttpError } from "./http-error";

type Payload = { userId: string; email: string };
type TokenType = "accessToken" | "refreshToken";

export const generateAccessAndRefreshToken = (
  userId: string,
  email: string
) => {
  const accessTokenOptions = {
    expiresIn: config.jwt.JWT_ACCESS_EXPIRES as StringValue,
  };

  const refreshTokenOptions = {
    expiresIn: config.jwt.JWT_REFRESH_EXPIRES as StringValue,
  };

  const accessToken = jwt.sign(
    { userId, email },
    config.jwt.JWT_ACCESS_SECRET,
    accessTokenOptions
  );

  const refreshToken = jwt.sign(
    { userId, email },
    config.jwt.JWT_REFRESH_SECRET,
    refreshTokenOptions
  );

  return { accessToken, refreshToken };
};

export const CreateAndSaveAuthTokenToDatabase = async (
  userId: string,
  email: string
) => {
  const { accessToken, refreshToken } = generateAccessAndRefreshToken(
    userId,
    email
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const deleteTokenPromise = AuthToken.deleteOne({ userId });
  const createTokenPromise = AuthToken.create({
    userId,
    refreshToken,
    accessToken,
    expiresAt,
  });

  await Promise.all([deleteTokenPromise, createTokenPromise]);

  return { accessToken, refreshToken };
};

export const verifyJwtToken = (
  token: string,
  tokenType: TokenType,
  jwtSecret: string
): Payload => {
  // Input validation

  if (!token || typeof token !== "string") {
    throw new HttpError("Token is required", 401);
  }

  if (!jwtSecret || typeof jwtSecret !== "string") {
    throw new HttpError("JWT secret is required", 401);
  }

  try {
    // Verify the token
    const payload = jwt.verify(token, jwtSecret);

    // Type guard to ensure payload has the expected structure
    if (typeof payload !== "object" || payload === null) {
      throw new HttpError("Invalid token payload", 401);
    }

    const typedPayload = payload as jwt.JwtPayload & Partial<Payload>;

    // Validate required fields
    if (!typedPayload.userId || !typedPayload.email) {
      throw new HttpError(
        "Token missing required fields: userId and email",
        401
      );
    }

    // Additional validation based on token type
    if (tokenType === "accessToken") {
      // Add access token specific validations if needed
      if (typedPayload.exp && Date.now() >= typedPayload.exp * 1000) {
        throw new HttpError("Access token has expired", 401);
      }
    } else if (tokenType === "refreshToken") {
      // Add refresh token specific validations if needed
      if (typedPayload.exp && Date.now() >= typedPayload.exp * 1000) {
        throw new HttpError("Refresh token has expired", 401);
      }
    }

    return {
      userId: typedPayload.userId,
      email: typedPayload.email,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError("Invalid token", 401);
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError("Token has expired", 401);
    }
    throw new HttpError("Token verification failed", 401);
  }
};
