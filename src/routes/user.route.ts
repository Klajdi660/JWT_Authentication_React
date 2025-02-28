import { Router } from "express";
import {
  saveAuthUser,
  getUsersListHandler,
  getUserDetailsHandler,
} from "../controllers";
import { deserializeUser, requireUser, restrictTo } from "../middleware";

const router = Router();

router.use(deserializeUser, requireUser);

router.get("/:id", getUserDetailsHandler);
router.post("/save-auth-user", saveAuthUser);
router.get("/all-users", restrictTo("admin"), getUsersListHandler);

export default router;
