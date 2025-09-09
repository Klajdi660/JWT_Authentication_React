import { Request, Response } from "express";
import {
  getGameDetails,
  getGameGenreList,
  getGameList,
  getGamePlatformsList,
  getGameReviews,
  getGamesSliderList,
  getGameVideos,
} from "../services";

export const gameListHandler = async (req: Request, res: Response) => {
  const gameList = await getGameList(req.query);
  if (!gameList) {
    return res.json({ error: true, message: "Failed to get games list" });
  }

  res.json({ error: false, data: gameList });
};

export const gameDetailsHandler = async (req: Request, res: Response) => {
  const gameId = req.query.gameId as string;

  const gameDetails = await getGameDetails(gameId);
  if (!gameDetails) {
    return res.json({ error: true, message: "Failed to get game details" });
  }

  res.json({ error: false, data: gameDetails });
};

export const gameVideosHandler = async (req: Request, res: Response) => {
  const gameId = req.query.gameId as string;

  const gameVideos = await getGameVideos(gameId);
  if (!gameVideos) {
    return res.json({ error: true, message: "Failed to get game videos" });
  }

  res.json({ error: false, data: gameVideos.results });
};

export const gameImagesHandler = async (req: Request, res: Response) => {
  const gameId = req.query.gameId as string;

  const gameImages = await getGameVideos(gameId);
  if (!gameImages) {
    return res.json({ error: true, message: "Failed to get game images" });
  }

  res.json({ error: false, data: gameImages });
};

export const gameReviewsHandler = async (req: Request, res: Response) => {
  const gameId = req.query.gameId as string;

  const gameReviews = await getGameReviews(gameId);
  if (!gameReviews) {
    return res.json({ error: true, message: "Failed to get game reviews" });
  }

  res.json({ error: false, data: gameReviews.results });
};

export const gameSliderHandler = async (req: Request, res: Response) => {
  const gameSlider = await getGamesSliderList();
  if (!gameSlider) {
    return res.json({ error: true, message: "Failed to get game slider" });
  }

  res.json({ error: false, data: gameSlider });
};

export const gameGenreListHandler = async (req: Request, res: Response) => {
  const genreList = await getGameGenreList();
  if (!genreList) {
    return res.json({ error: true, message: "Failed to get game list" });
  }

  res.json({ error: false, data: genreList.results });
};

export const gamePlatformsListHandler = async (req: Request, res: Response) => {
  const platformsList = await getGamePlatformsList();
  if (!platformsList) {
    return res.json({ error: true, message: "Failed to get platforms list" });
  }

  res.json({ error: false, data: platformsList.results });
};
