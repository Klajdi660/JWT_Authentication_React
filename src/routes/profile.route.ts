import { Router } from "express";
import {
  changePasswordHandler,
  deleteAccountHandler,
  updateProfileHandler,
  updateDisplayPictureHandler,
  cancelDeletionHandler,
  changeUsernameHandler,
  removeDisplayPictureHandler,
} from "../controllers";
import { deserializeUser, requireUser, validate } from "../middleware";
import {
  deleteAccountSchema,
  changePasswordSchema,
  changeUsernameSchema,
} from "../schema";

const router = Router();

router.use(deserializeUser, requireUser);

router.post(
  "/change-username",
  validate(changeUsernameSchema),
  changeUsernameHandler
);
router.post(
  "/change-password",
  validate(changePasswordSchema),
  changePasswordHandler
);
router.post(
  "/delete-account",
  validate(deleteAccountSchema),
  deleteAccountHandler
);
router.post("/cancel-deletion", cancelDeletionHandler);

router.put("/update-profile", updateProfileHandler);
router.put("/update-display-picture", updateDisplayPictureHandler);

router.delete("/remove-display-picture", removeDisplayPictureHandler);

export default router;
