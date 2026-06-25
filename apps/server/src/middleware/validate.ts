import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

// Validates and replaces req.body with the parsed result. A ZodError thrown by
// schema.parse propagates to the central errorHandler (Express 5 forwards it),
// producing the standard 400 response.
export const validateBody =
  (schema: ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
