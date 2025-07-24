import { Router } from "express";
import {
  saveAuthUser,
  getUsersListHandler,
  getUserDetailsHandler,
  getUserByUsernameHandler,
  createUserHandler,
  verfyUserHandler,
  verifyCodeHandler,
  resendCodeHandler,
} from "../controllers";
import { ROLES } from "../constants";
import {
  deserializeUser,
  requireUser,
  checkRole,
  validate,
} from "../middleware";
import {
  createUserSchema,
  verifyCodeSchema,
  verifyUserSchema,
} from "../schema";

const router = Router();

// router.get("/:username", getUserByUsernameHandler);

router.post("/create", validate(createUserSchema), createUserHandler);
router.post("/verify", validate(verifyUserSchema), verfyUserHandler);
router.post("/verify-code", validate(verifyCodeSchema), verifyCodeHandler);
router.post("/resend-code", resendCodeHandler);

// router.use(deserializeUser, requireUser);
// router.get("/:id", getUserDetailsHandler);
// router.post("/save-auth-user", saveAuthUser);
// router.get("/all-users", checkRole(ROLES.Admin), getUsersListHandler);

export default router;
