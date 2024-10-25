import { NextFunction, Request, Response } from "express";
import { getUserById } from "../services";
import { verifyJwt, log } from "../utils";
import { redisCLI } from "../clients";

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

    // Validate Access Token
    const decoded = verifyJwt<{ id: string }>(
      accessToken,
      "accessTokenPublicKey"
    );
    if (!decoded) {
      return next({
        error: true,
        message: "Invalid token or user doesn't exist",
      });
    }

    // Check if user has a valid session
    const session = await redisCLI.get(`session_${decoded.id}`);

    if (!session) {
      return next({ error: true, message: "User session has expired" });
    }

    // Check if user still exist
    const user = await getUserById(JSON.parse(session).id);
    if (!user) {
      return next({
        error: true,
        messahe: "User with that token no longer exist",
      });
    }

    // This is really important (Helps us know if the user is logged in from other controllers)
    // You can do: (req.user or res.locals.user)
    res.locals.user = user;

    next();
  } catch (e: any) {
    log.error(
      `${JSON.stringify({
        action: "deserializeUser catch",
        message: e.message,
      })}`
    );
    next(e);
  }
};
