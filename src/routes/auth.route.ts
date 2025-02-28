import config from "config";
import { Router } from "express";
import passport from "passport";
import {
  validate,
  requireUser,
  deserializeUser,
  authenticateUser,
} from "../middleware";
import {
  loginUserSchema,
  createUserSchema,
  verifyEmailSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} from "../schema";
import {
  loginHandler,
  logoutHandler,
  registerHandler,
  verifyEmailHandler,
  googleOauthHandler,
  resetPasswordHandler,
  forgotPasswordHandler,
  loginWithSavedUserHandler,
  // refreshAccessTokenHandler,
} from "../controllers";
import { AppConfigs } from "../types";

const { prefix } = config.get<AppConfigs>("appConfigs");

const router = Router();

router.post("/login", validate(loginUserSchema), loginHandler);
router.post("/register", validate(createUserSchema), registerHandler);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmailHandler);
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordHandler
);
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
