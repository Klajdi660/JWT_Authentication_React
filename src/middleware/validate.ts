import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { log } from "../utils";

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        params: req.params,
        query: req.query,
        body: req.body,
      });

      next();
    } catch (e: any) {
      if (e instanceof ZodError) {
        log.error(
          `${JSON.stringify({ action: "validate catch", data: e.errors })}`
        );
        return res.json({
          error: true,
          message: e.errors[0].message,
        });
      }
      next({ error: true, message: e.errors[0].message });
    }
  };
