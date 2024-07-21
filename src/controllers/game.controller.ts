import { Request, Response } from "express";
import {
  getGameList,
  getGameDetail,
  getGameVideos,
  getGameReviews,
} from "../services";

export const gameListHandler = async (req: Request, res: Response) => {
  const { page, pageSize } = req.query;

  const params = {
    page,
    page_size: pageSize,
  };

  const gameListResp = await getGameList(params);
  if (!gameListResp) {
    return res.json({ error: true, message: "Failed to get games list" });
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
    data: gameReviewsResp.results,
  });
};
