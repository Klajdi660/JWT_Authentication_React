import config from "config";
import passport from "passport";
import { Router } from "express";
import {
  forgotPasswordSchema,
  loginHelpSchema,
  loginUserSchema,
} from "../schema";
import {
  authenticateUser,
  deserializeUser,
  requireUser,
  validate,
} from "../middleware";
import {
  forgotPasswordHandler,
  googleOauthHandler,
  loginHandler,
  loginHelpHandler,
  loginWithSavedUserHandler,
  logoutHandler,
} from "../controllers";
import { AppConfigs } from "../types";

const { prefix } = config.get<AppConfigs>("appConfigs");

const router = Router();

router.post("/login", validate(loginUserSchema), loginHandler);
router.post("/login-help", validate(loginHelpSchema), loginHelpHandler);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordHandler
);

// router.get("/refresh", refreshAccessTokenHandler);
router.get(
  "/login-saved-user",
  authenticateUser,
  requireUser,
  loginWithSavedUserHandler
);
router.get("/logout", deserializeUser, requireUser, logoutHandler);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${prefix}/auth/google/error`,
    session: false,
  }),
  googleOauthHandler
);

router.get("/google/error", (req, res) =>
  res.json({ error: true, message: "Error logging in via Google..." })
);

export default router;
