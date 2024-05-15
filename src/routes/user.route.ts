import { Router } from "express";
import {
  getAllUsersHandler,
  getMeHandler,
} from "../controllers/user.controller";
import { deserializeUser } from "../middleware/deserializeUser";
import { requireUser } from "../middleware/requireUser";
import { restrictTo } from "../middleware/restrictTo";

const router = Router();

router.use(deserializeUser, requireUser);

router.get("/all", restrictTo("admin"), getAllUsersHandler);
router.get("/:id", getMeHandler);

export default router;
