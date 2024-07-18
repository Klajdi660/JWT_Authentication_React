import { Router } from "express";
import {
  gameListHandler,
  gameDetailHandler,
  gameVideosHandler,
} from "../controllers";

const router = Router();

router.get("/", gameListHandler);
router.get("/game-detail", gameDetailHandler);
router.get("/game-videos", gameVideosHandler);

export default router;
