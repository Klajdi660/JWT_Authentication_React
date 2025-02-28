import { Router } from "express";
import {
  gameListHandler,
  gameImagesHandler,
  gameVideosHandler,
  gameSliderHandler,
  gameDetailsHandler,
  gameReviewsHandler,
  gameGenreListHandler,
  gamePlatformsListHandler,
} from "../controllers";

const router = Router();

router.get("/", gameListHandler);
router.get("/game-slider", gameSliderHandler);
router.get("/game-videos", gameVideosHandler);
router.get("/game-images", gameImagesHandler);
router.get("/game-detail", gameDetailsHandler);
router.get("/game-reviews", gameReviewsHandler);
router.get("/game-genre-list", gameGenreListHandler);
router.get("/game-platform-list", gamePlatformsListHandler);

export default router;
