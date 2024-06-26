import { Router } from "express";
import {
  changePasswordHandler,
  deleteAccountHandler,
  updateProfileHandler,
  updateDisplayPictureHandler,
  cancelDeletionHandler,
} from "../controllers";
import { deserializeUser, requireUser, validate } from "../middleware";
import { deleteAccountSchema, changePasswordSchema } from "../schema";

const router = Router();

router.use(deserializeUser, requireUser);

router.post(
  "/change-password",
  validate(changePasswordSchema),
  changePasswordHandler
);

router.delete(
  "/delete-account",
  validate(deleteAccountSchema),
  deleteAccountHandler
);
router.post("/cancle-deletion", cancelDeletionHandler);

router.put("/update-profile", updateProfileHandler);
router.put("/update-display-picture", updateDisplayPictureHandler);

export default router;
