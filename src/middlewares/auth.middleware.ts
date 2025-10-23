import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/jwt.service";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;
    if (!header)
      return res.status(401).json({ error: "No authorization header" });
    const token = header.split(" ")[1];
    const payload = verifyAccessToken(token) as any;
    // attach payload to request
    (req as any).user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
