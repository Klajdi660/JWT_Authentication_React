import { Router } from "express";
import { deleteProfileHandler, updateProfileHandler } from "../controllers";
import { deserializeUser, requireUser, restrictTo } from "../middleware";

const router = Router();

router.use(deserializeUser, requireUser);

router.delete("/:id", deleteProfileHandler);

router.put("/update-profile", updateProfileHandler);

export default router;
