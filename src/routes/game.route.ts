import { Router } from "express";
import {
  gameListHandler,
  gameDetailHandler,
  gameVideosHandler,
  gameReviewsHandler,
  gameSliderHandler,
  gameGenreListHandler,
} from "../controllers";

const router = Router();

router.get("/", gameListHandler);
router.get("/game-detail", gameDetailHandler);
router.get("/game-videos", gameVideosHandler);
router.get("/game-reviews", gameReviewsHandler);
router.get("/game-slider", gameSliderHandler);
router.get("/game-genre-list", gameGenreListHandler);

export default router;
