import { Router } from "express";
import {
  getUsersListHandler,
  getUserDetailsHandler,
  saveAuthUser,
} from "../controllers";
import { deserializeUser, requireUser, restrictTo } from "../middleware";

const router = Router();

router.use(deserializeUser, requireUser);

router.post("/save-auth-user", saveAuthUser);

router.get("/all-users", restrictTo("admin"), getUsersListHandler);
router.get("/:id", getUserDetailsHandler);

export default router;
