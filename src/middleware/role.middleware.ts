import { NextFunction, Request, Response } from "express";

export const checkRole =
  (...allowedRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;
    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    if (!allowedRoles.includes(user.role)) {
      return next({
        error: true,
        message: "You are not allowed to perform this action",
      });
    }

    next();
  };
