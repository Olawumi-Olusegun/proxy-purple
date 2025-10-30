import { NextFunction, Request, Response } from "express";
import * as z from "zod";

type SchemaValidationType = {
  body?: z.ZodObject<z.ZodRawShape>;
  params?: z.ZodObject<z.ZodRawShape>;
  query?: z.ZodObject<z.ZodRawShape>;
};

export function validateData(schemas: SchemaValidationType) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) schemas.body.parse(req.body);
      if (schemas.params) schemas.params.parse(req.params);
      if (schemas.query) schemas.query.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0];
        let message = firstIssue.message;

        // Check if it's an invalid_type error with undefined received
        if (
          firstIssue.code === "invalid_type" &&
          message.includes("received undefined")
        ) {
          const fieldName = firstIssue.path[0];
          const expected =
            "expected" in firstIssue ? firstIssue.expected : null;
          const isPlural = expected === "array";
          message = `${
            String(fieldName).charAt(0).toUpperCase() +
            String(fieldName).slice(1)
          } ${isPlural ? "are" : "is"} required`;
        }

        return res.status(400).json({
          message,
          success: false,
        });
      }
      return res.status(500).json({ message: "Invalid data", success: false });
    }
  };
}
