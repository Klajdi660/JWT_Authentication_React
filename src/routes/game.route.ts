import { Router } from "express";
import {
  gameDetailsHandler,
  gameGenreListHandler,
  gameImagesHandler,
  gameListHandler,
  gamePlatformsListHandler,
  gameReviewsHandler,
  gameSliderHandler,
  gameVideosHandler,
} from "../controllers";

const router = Router();

router.get("/", gameListHandler);
router.get("/game-slider", gameSliderHandler);
router.get("/game-videos/:gameId", gameVideosHandler);
router.get("/game-images/:gameId", gameImagesHandler);
router.get("/game-detail/:gameId", gameDetailsHandler);
router.get("/game-reviews/:gameId", gameReviewsHandler);
router.get("/game-genre-list", gameGenreListHandler);
router.get("/game-platform-list", gamePlatformsListHandler);

export default router;
