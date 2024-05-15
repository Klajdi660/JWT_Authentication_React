import { Router } from "express";
import {
  deleteProfileHandler,
  updateProfileHandler,
  updateProfilePhotoHandler,
} from "../controllers";
import { deserializeUser, requireUser } from "../middleware";

const router = Router();

router.use(deserializeUser, requireUser);

router.delete("/:id", deleteProfileHandler);

router.put("/update-profile", updateProfileHandler);

router.put("/update-profile-photo", updateProfilePhotoHandler);

export default router;
