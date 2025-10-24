import { NextFunction, Request, Response } from "express";
import z from "zod";

// eslint-disable-next-line
export function validateData(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (!parsed.success) {
        // Format errors in a more readable manner
        const errorMessages =
          parsed.error.issues[0]?.message ?? "Invalid request";

        return res.status(400).json({
          message: "Validation failed",
          errors: errorMessages,
        });
      }

      next();
    } catch {
      return res.status(500).json({ message: "Invalid data" });
    }
  };
}
