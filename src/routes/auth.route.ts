import { Router } from "express";
import config from "config";
import passport from "passport";
import {
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  // refreshAccessTokenHandler,
  registerHandler,
  resetPasswordHandler,
  verifyEmailHandler,
  googleOauthHandler,
} from "../controllers";
import { deserializeUser, requireUser, validate } from "../middleware";
import {
  createUserSchema,
  loginUserSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schema";
import { AppConfig } from "../types";

const { origin, prefix } = config.get<AppConfig>("app");

const router = Router();

router.post("/register", validate(createUserSchema), registerHandler);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmailHandler);
router.post("/login", validate(loginUserSchema), loginHandler);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordHandler
);

// router.get("/refresh", refreshAccessTokenHandler);
router.get("/logout", deserializeUser, requireUser, logoutHandler);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordHandler
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    // failureRedirect: `${origin}/login`,
    // session: false,
    failureRedirect: `${prefix}/auth/google/error`,
    session: false,
  }),
  googleOauthHandler
);

router.get("/google/error", (req, res) =>
  res.json({ error: true, message: "Error logging in via Google..." })
);

export default router;
