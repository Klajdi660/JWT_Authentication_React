import { NextFunction, Request, Response } from "express";
import { redisCLI } from "../clients";
import { getUserById } from "../services";
import { log, verifyJwt } from "../utils";

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;
    const { access_token } = req.cookies;

    let accessToken;
    if (authorization && authorization.startsWith("Bearer")) {
      accessToken = authorization.split(" ")[1];
    } else if (access_token) {
      accessToken = access_token;
    }

    if (!accessToken) {
      return next({ error: true, message: "You are not logged in" });
    }

    const decoded = verifyJwt<{ id: string }>(
      accessToken,
      "accessTokenPublicKey"
    ) as any;
    if (!decoded) {
      return next({
        error: true,
        message: "Invalid token or user doesn't exist",
      });
    }

    const session = await redisCLI.get(`session_${decoded.id}`);
    if (!session) {
      return next({ error: true, message: "User session has expired" });
    }

    const user = await getUserById(JSON.parse(session).id);
    if (!user) {
      return next({
        error: true,
        messahe: "User with that token no longer exist",
      });
    }

    // You can do: (req.user or res.locals.user)
    res.locals.user = user;

    next();
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "deserialize_user_catch",
        message: e.message,
      })
    );
    next(e);
  }
};

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;
    const { access_token } = req.cookies;

    let accessToken;
    if (authorization && authorization.startsWith("Bearer")) {
      accessToken = authorization.split(" ")[1];
    } else if (access_token) {
      accessToken = access_token;
    }

    if (!accessToken) {
      return next({ error: true, message: "You are not logged in" });
    }

    const decoded = verifyJwt<{ id: string }>(
      accessToken,
      "accessTokenPublicKey"
    ) as any;
    if (!decoded) {
      return next({
        error: true,
        message: "Invalid token or user doesn't exist",
      });
    }

    const user = await getUserById(decoded.id);

    res.locals.user = user;

    next();
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "authenticate_user_catch",
        message: e.message,
      })
    );
    next(e);
  }
};
