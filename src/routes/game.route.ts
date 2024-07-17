import { Router } from "express";
import { gameListHandler, gameDetailHandler } from "../controllers";

const router = Router();

router.get("/", gameListHandler);
router.get("/game-detail", gameDetailHandler);

export default router;
