import { Router } from "express";
import {
  saveAuthUser,
  getUsersListHandler,
  getUserDetailsHandler,
} from "../controllers";
import { ROLES } from "../constants";
import { deserializeUser, requireUser, checkRole } from "../middleware";

const router = Router();

router.use(deserializeUser, requireUser);

router.get("/:id", getUserDetailsHandler);
router.post("/save-auth-user", saveAuthUser);
router.get("/all-users", checkRole(ROLES.admin), getUsersListHandler);

export default router;
