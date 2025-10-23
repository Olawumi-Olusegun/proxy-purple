import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { StringValue } from "ms";
import config from "../config";

export function signAccessToken(payload: any) {
  const options: SignOptions = {
    expiresIn: config.jwt.JWT_ACCESS_EXPIRES as StringValue, // '1h', '15m', 3600, etc.
  };
  return jwt.sign(payload, config.jwt.JWT_ACCESS_SECRET as Secret, options);
}

export function signRefreshToken(payload: any) {
  const options: SignOptions = {
    expiresIn: config.jwt.JWT_REFRESH_EXPIRES as StringValue, // '1h', '15m', 3600, etc.
  };
  return jwt.sign(payload, config.jwt.JWT_REFRESH_SECRET as Secret, options);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, config.jwt.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, config.jwt.JWT_REFRESH_SECRET);
}
