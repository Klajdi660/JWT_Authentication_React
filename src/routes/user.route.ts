import { Router } from "express";
import {
  saveAuthUser,
  getUsersListHandler,
  getUserDetailsHandler,
  getUserByUsernameHandler,
} from "../controllers";
import { ROLES } from "../constants";
import { deserializeUser, requireUser, checkRole } from "../middleware";

const router = Router();

router.get("/:username", getUserByUsernameHandler);

router.use(deserializeUser, requireUser);
router.get("/:id", getUserDetailsHandler);
router.post("/save-auth-user", saveAuthUser);
router.get("/all-users", checkRole(ROLES.Admin), getUsersListHandler);

export default router;
