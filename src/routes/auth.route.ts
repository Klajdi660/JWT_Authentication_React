import config from "config";
import passport from "passport";
import { Router } from "express";
import {
  loginUserSchema,
  createUserSchema,
  verifyAccountSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} from "../schema";
import {
  validate,
  requireUser,
  deserializeUser,
  authenticateUser,
} from "../middleware";
import {
  loginHandler,
  logoutHandler,
  createUserHandler,
  verfyAccountHandler,
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
router.post("/register", validate(createUserSchema), createUserHandler);
router.post(
  "/verify-account",
  validate(verifyAccountSchema),
  verfyAccountHandler
);
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
