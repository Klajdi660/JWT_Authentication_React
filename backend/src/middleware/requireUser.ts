import { NextFunction, Request, Response } from "express";
import { log } from "../utils";

export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;
    if (!user) {
      return next({
        error: true,
        message: "Invalid token or session has expired",
      });
    }

    next();
  } catch (e: any) {
    log.error(
      `${JSON.stringify({ action: "requireUSer catch", message: e.message })}`
    );
    next(e);
  }
};
