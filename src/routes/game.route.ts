import { Router } from "express";
import { gameListHandler } from "../controllers";

const router = Router();

router.post("/", gameListHandler);

export default router;
