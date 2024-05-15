import { Router } from "express";
import {
  // forgotPasswordHandler,
  loginHandler,
  // logoutHandler,
  // refreshAccessTokenHandler,
  // registerHandler,
  // resetPasswordHandler,
  // verifyEmailHandler,
} from "../controllers";
import { deserializeUser, requireUser, validate } from "../middleware";
import {
  createUserSchema,
  loginUserSchema,
  verifyEmailSchema,
} from "../schema";

const router = Router();

// router.post("/register", validate(createUserSchema), registerHandler);
router.post("/login", validate(loginUserSchema), loginHandler);
// router.post("/forgotpassword", forgotPasswordHandler);

// router.get("/refresh", refreshAccessTokenHandler);
// router.get("/logout", deserializeUser, requireUser, logoutHandler);
// router.get(
//   "/verifyemail/:verificationCode",
//   validate(verifyEmailSchema),
//   verifyEmailHandler
// );

// router.patch("/resetpassword/:resetToken", resetPasswordHandler);

export default router;
