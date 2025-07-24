import { Router } from "express";
import {
  saveAuthUser,
  getUsersListHandler,
  getUserDetailsHandler,
  getUserByUsernameHandler,
  createUserHandler,
  verfyUserHandler,
  confirmUserHandler,
} from "../controllers";
import { ROLES } from "../constants";
import {
  deserializeUser,
  requireUser,
  checkRole,
  validate,
} from "../middleware";
import {
  confirmUserSchema,
  createUserSchema,
  verifyUserSchema,
} from "../schema";

const router = Router();

// router.get("/:username", getUserByUsernameHandler);

router.post("/create", validate(createUserSchema), createUserHandler);
router.post("/confirm", validate(confirmUserSchema), confirmUserHandler);
router.post("/verify", validate(verifyUserSchema), verfyUserHandler);

// router.use(deserializeUser, requireUser);
// router.get("/:id", getUserDetailsHandler);
// router.post("/save-auth-user", saveAuthUser);
// router.get("/all-users", checkRole(ROLES.Admin), getUsersListHandler);

export default router;
