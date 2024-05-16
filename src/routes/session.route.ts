import { Router } from "express";
import config from "config";
import passport from "passport";
import { googleOauthHandler } from "../controllers";
import { AppConfig } from "../types";
// import {
//   githubOauthHandler,
//   googleOauthHandler,
// } from '../controllers/auth.controller';

const { origin } = config.get<AppConfig>("app");

const router = Router();

// router.get("/oauth/google", googleOauthHandler);
// router.get('/oauth/github', githubOauthHandler);

router.get(
  "/oauth-google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/oauth-google/callback",
  passport.authenticate("google", {
    failureRedirect: `${origin}/login`,
    session: false,
  })
);
export default router;
