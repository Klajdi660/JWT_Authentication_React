import { Request, Response } from "express";
import {
  getGameList,
  getGameDetail,
  getGameVideos,
  getGameReviews,
  getGamesSliderList,
  getGameGenreList,
  getGamePlatformList,
} from "../services";
import { log } from "../utils";

export const gameListHandler = async (req: Request, res: Response) => {
  const gameListResp = await getGameList(req.query);
  if (!gameListResp) {
    log.error(JSON.stringify({ action: "getGameList", data: gameListResp }));
    return res.json({ error: true, message: "Failed to get games list" });
    // return null;
  }

  res.json({
    error: false,
    message: "Success get games list",
    data: gameListResp,
  });
};

export const gameDetailHandler = async (req: Request, res: Response) => {
  const { gameId } = req.query;

  const gameDetailResp = await getGameDetail(gameId);
  if (!gameDetailResp) {
    return res.json({ error: true, message: "Failed to get game details" });
  }

  res.json({
    error: false,
    message: "Success get games details",
    data: gameDetailResp,
  });
};

export const gameVideosHandler = async (req: Request, res: Response) => {
  const { gameId } = req.query;

  const gameVideosResp = await getGameVideos(gameId);
  if (!gameVideosResp) {
    return res.json({ error: true, message: "Failed to get game videos" });
  }

  res.json({
    error: false,
    message: "Success get games videos",
    data: gameVideosResp,
  });
};

export const gameReviewsHandler = async (req: Request, res: Response) => {
  const { gameId } = req.query;

  const gameReviewsResp = await getGameReviews(gameId);
  if (!gameReviewsResp) {
    return res.json({ error: true, message: "Failed to get game reviews" });
  }

  res.json({
    error: false,
    message: "Success get game reviews",
    data: gameReviewsResp?.results,
  });
};

export const gameSliderHandler = async (req: Request, res: Response) => {
  const gameSliderResp = await getGamesSliderList();
  if (!gameSliderResp) {
    return res.json({ error: true, message: "Failed to get game slider" });
  }

  res.json({
    error: false,
    message: "Success get game slider",
    data: gameSliderResp,
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
    data: genreList?.results,
  });
};

export const gamePlatformList = async (req: Request, res: Response) => {
  const platformList = await getGamePlatformList();
  if (!platformList) {
    return res.json({ error: true, message: "Failed to get platforms list" });
  }

  res.json({
    error: false,
    message: "Success get platforms list",
    data: platformList?.results,
  });
};
