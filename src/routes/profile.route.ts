import { Router } from "express";
import {
  deleteAccountSchema,
  changePasswordSchema,
  changeUsernameSchema,
} from "../schema";
import {
  deleteAccountHandler,
  updateProfileHandler,
  cancelDeletionHandler,
  changeUsernameHandler,
  changePasswordHandler,
  addNewCreditCardHandler,
  removeDisplayPictureHandler,
  updateDisplayPictureHandler,
} from "../controllers";
import { deserializeUser, requireUser, validate } from "../middleware";

const router = Router();

router.use(deserializeUser, requireUser);

router.post(
  "/delete-account",
  validate(deleteAccountSchema),
  deleteAccountHandler
);
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
router.post("/update-profile", updateProfileHandler);
router.post("/cancel-deletion", cancelDeletionHandler);
router.post("/add-credit-card", addNewCreditCardHandler);
router.put("/update-display-picture", updateDisplayPictureHandler);
router.delete("/remove-display-picture", removeDisplayPictureHandler);

export default router;
