import { Router } from "express";
import { getAllUsersHandler, getMeHandler } from "../controllers";
import { deserializeUser, requireUser, restrictTo } from "../middleware";

const router = Router();

router.use(deserializeUser, requireUser);

router.get("/all", restrictTo("admin"), getAllUsersHandler);
router.get("/:id", getMeHandler);

export default router;
