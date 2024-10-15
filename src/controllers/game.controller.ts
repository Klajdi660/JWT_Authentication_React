import { Request, Response } from "express";
import {
  getGameList,
  getGameDetail,
  getGameVideos,
  getGameReviews,
  getGamesSliderList,
  getGameGenreList,
} from "../services";
import { log } from "../utils";

export const gameListHandler = async (req: Request, res: Response) => {
  const { page } = req.query;

  const gameListResp = await getGameList(page);
  // if (!gameListResp) {
  //   return res.json({ error: true, message: "Failed to get games list" });
  // }
  if (!gameListResp) {
    log.error(JSON.stringify({ action: "getGameList", data: gameListResp }));
    return null;
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
    return;
    // return res.json({ error: true, message: "Failed to get game details" });
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
    return res.json({ error: true, message: "Failed to get game details" });
  }

  res.json({
    error: false,
    message: "Success get games details",
    data: gameVideosResp,
  });
};

export const gameReviewsHandler = async (req: Request, res: Response) => {
  const { gameId } = req.query;

  const gameReviewsResp = await getGameReviews(gameId);
  if (!gameReviewsResp) {
    return res.json({ error: true, message: "Failed to get game revies" });
  }

  res.json({
    error: false,
    message: "Success get games details",
    data: gameReviewsResp?.results,
  });
};

export const gameSliderHandler = async (req: Request, res: Response) => {
  const games = await getGamesSliderList();

  res.json({
    error: false,
    message: "Success get games details",
    data: games,
  });
};

export const gameGenreListHandler = async (req: Request, res: Response) => {
  const genreList = await getGameGenreList();

  res.json({
    error: false,
    message: "Success get gendre list",
    data: genreList?.results,
  });
};
