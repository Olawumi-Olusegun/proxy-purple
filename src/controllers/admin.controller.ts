import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/type";

export const getAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.user);
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
