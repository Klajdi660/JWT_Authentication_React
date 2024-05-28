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
  resendOtpCodeHandler,
} from "../controllers";
import { deserializeUser, requireUser, validate } from "../middleware";
import {
  createUserSchema,
  loginUserSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resendOtpCodeSchema,
} from "../schema";
import { AppConfig } from "../types";

const { origin } = config.get<AppConfig>("app");

const router = Router();

router.post("/register", validate(createUserSchema), registerHandler);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmailHandler);
router.post("/login", validate(loginUserSchema), loginHandler);
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordHandler
);
router.post(
  "/resend-code",
  validate(resendOtpCodeSchema),
  resendOtpCodeHandler
);

// router.get("/refresh", refreshAccessTokenHandler);
router.get("/logout", deserializeUser, requireUser, logoutHandler);

router.patch("/reset-password", resetPasswordHandler);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${origin}/login`,
    session: false,
  }),
  googleOauthHandler
);

export default router;
