import { Router } from "express";
import { getMailTemplate } from "../controllers";

const router = Router();

router.post("/:role/:hostname/:type", getMailTemplate);

export default router;
