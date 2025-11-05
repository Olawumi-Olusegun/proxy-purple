import { NextFunction, Request, Response } from "express";
import * as z from "zod";

type validationOptions = {
  body?: z.ZodSchema;
  params?: z.ZodSchema;
  query?: z.ZodSchema;
};

export function validateData(schema: validationOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        const validatedBody = schema.body.parse(req.body);
        req.body = validatedBody as Request["body"];
      }

      if (schema.params) {
        const validatedParams = schema.params.parse(req.params);
        req.params = validatedParams as Request["params"];
      }

      if (schema.query) {
        const validatedQuery = schema.query.parse(req.query);
        req.query = validatedQuery as Request["query"];
      }

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
