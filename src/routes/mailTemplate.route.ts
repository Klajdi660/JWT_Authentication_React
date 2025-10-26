import { Router } from "express";
import { getMailTemplate } from "../controllers";

const router = Router();

router.get("/:role/:hostname/:type", getMailTemplate);

export default router;
