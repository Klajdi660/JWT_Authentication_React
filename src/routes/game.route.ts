import { Router } from "express";
import {
  gameListHandler,
  gameDetailHandler,
  gameVideosHandler,
  gameReviewsHandler,
  gameSliderHandler,
} from "../controllers";

const router = Router();

router.get("/", gameListHandler);
router.get("/game-detail", gameDetailHandler);
router.get("/game-videos", gameVideosHandler);
router.get("/game-reviews", gameReviewsHandler);
router.get("/game-slider", gameSliderHandler);

export default router;
