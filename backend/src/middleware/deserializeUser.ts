import { NextFunction, Request, Response } from "express";
import { findUserById } from "../services/user.service";
import { verifyJwt, log } from "../utils";
import { redisCLI } from "../clients";

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the token
    let access_token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      access_token = req.headers.authorization.split(" ")[1];
      console.log("HYRIII 111:>> ");
      console.log("object :>> ", req.headers.authorization);
    } else if (req.cookies.access_token) {
      console.log("HYRIII 222:>> ");
      access_token = req.cookies.access_token;
    }

    if (!access_token) {
      return next({ error: true, message: "You are not logged in" });
    }
    console.log("access_token :>> ", access_token);
    // Validate Access Token
    const decoded = verifyJwt<{ sub: string }>(
      access_token,
      "accessTokenPublicKey"
    );
    console.log("decoded 111:>> ", decoded);
    if (!decoded) {
      return next({
        error: true,
        message: "Invalid token or user doesn't exist",
      });
    }

    // Check if user has a valid session
    const session = await redisCLI.get(decoded.sub);

    if (!session) {
      return next({ error: true, message: "User session has expired" });
    }

    // Check if user still exist
    const user = await findUserById(JSON.parse(session).id);

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
