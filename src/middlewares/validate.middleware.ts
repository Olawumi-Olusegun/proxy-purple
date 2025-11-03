import { NextFunction, Request, Response } from "express";
import * as z from "zod";

export enum ValidationSource {
  BODY = "body",
  PARAMS = "params",
  QUERY = "query",
  HEADERS = "headers",
}

export function validateData(schemas: z.ZodSchema, source: ValidationSource) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schemas.parse(req[source]);
      Object.assign(req[source], parsed);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.issues[0].message;
        return res.status(400).json({ success: false, message });
      } else {
        return res
          .status(500)
          .json({ message: "Invalid data", success: false });
      }
    }
  };
}
