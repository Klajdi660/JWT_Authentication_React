import { Router } from "express";
import { gameListHandler } from "../controllers";

const router = Router();

router.get("/", gameListHandler);

export default router;
