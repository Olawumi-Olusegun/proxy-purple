import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export function validate(schema: ZodSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (err: any) {
      const message = err?.issues?.[0]?.message || "Invalid request";
      return res.status(400).send(message);
    }
  };
}
