import { Router } from "express";
import {
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  // refreshAccessTokenHandler,
  registerHandler,
  resetPasswordHandler,
  verifyEmailHandler,
} from "../controllers";
import { deserializeUser, requireUser, validate } from "../middleware";
import {
  createUserSchema,
  loginUserSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
} from "../schema";

const router = Router();

router.post("/register", validate(createUserSchema), registerHandler);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmailHandler);
router.post("/login", validate(loginUserSchema), loginHandler);
router.post(
  "/forgotpassword",
  validate(forgotPasswordSchema),
  forgotPasswordHandler
);

// router.get("/refresh", refreshAccessTokenHandler);
router.get("/logout", deserializeUser, requireUser, logoutHandler);

router.patch("/resetpassword", resetPasswordHandler);

export default router;
