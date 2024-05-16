import { Router } from "express";
import {
  changePasswordHandler,
  deleteAccountHandler,
  updateProfileHandler,
  updateDisplayPictureHandler,
} from "../controllers";
import { deserializeUser, requireUser } from "../middleware";

const router = Router();

router.use(deserializeUser, requireUser);

router.post("/change-password", changePasswordHandler);
router.delete("/:id", deleteAccountHandler);

router.put("/update-profile", updateProfileHandler);
router.put("/update-display-picture", updateDisplayPictureHandler);

export default router;
