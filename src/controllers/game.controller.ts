import { Request, Response } from "express";
import {
  getGameList,
  getGameDetails,
  getGameVideos,
  getGameReviews,
  getGamesSliderList,
  getGameGenreList,
  getGamePlatformsList,
} from "../services";
import { log } from "../utils";

export const gameListHandler = async (req: Request, res: Response) => {
  const gameList = await getGameList(req.query);
  if (!gameList) {
    log.error(JSON.stringify({ action: "getGameList", data: gameList }));
    return res.json({ error: true, message: "Failed to get games list" });
    // return null;
  }

  res.json({
    error: false,
    message: "Success get games list",
    data: gameList,
  });
};

export const gameDetailsHandler = async (req: Request, res: Response) => {
  const { gameId } = req.query;

  const gameDetails = await getGameDetails(gameId);
  if (!gameDetails) {
    return res.json({ error: true, message: "Failed to get game details" });
  }

  res.json({
    error: false,
    message: "Success get game details",
    data: gameDetails,
  });
};

export const gameVideosHandler = async (req: Request, res: Response) => {
  const { gameId } = req.query;

  const gameVideos = await getGameVideos(gameId);
  if (!gameVideos) {
    return res.json({ error: true, message: "Failed to get game videos" });
  }

  res.json({
    error: false,
    message: "Success get games videos",
    data: gameVideos,
  });
};

export const gameImagesHandler = async (req: Request, res: Response) => {
  const { gameId } = req.query;

  const gameImages = await getGameVideos(gameId);
  if (!gameImages) {
    return res.json({ error: true, message: "Failed to get game images" });
  }

  res.json({
    error: false,
    message: "Success get games images",
    data: gameImages,
  });
};

export const gameReviewsHandler = async (req: Request, res: Response) => {
  const { gameId } = req.query;

  const gameReviews = await getGameReviews(gameId);
  if (!gameReviews) {
    return res.json({ error: true, message: "Failed to get game reviews" });
  }

  res.json({
    error: false,
    message: "Success get game reviews",
    data: gameReviews.results,
  });
};

export const gameSliderHandler = async (req: Request, res: Response) => {
  const gameSlider = await getGamesSliderList();
  if (!gameSlider) {
    return res.json({ error: true, message: "Failed to get game slider" });
  }

  res.json({
    error: false,
    message: "Success get game slider",
    data: gameSlider,
  });
};

export const gameGenreListHandler = async (req: Request, res: Response) => {
  const genreList = await getGameGenreList();
  if (!genreList) {
    return res.json({ error: true, message: "Failed to get game list" });
  }

  res.json({
    error: false,
    message: "Success get genre list",
    data: genreList.results,
  });
};

export const gamePlatformsListHandler = async (req: Request, res: Response) => {
  const platformsList = await getGamePlatformsList();
  if (!platformsList) {
    return res.json({ error: true, message: "Failed to get platforms list" });
  }

  res.json({
    error: false,
    message: "Success get platforms list",
    data: platformsList.results,
  });
};
