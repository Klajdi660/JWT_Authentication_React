import { Request, Response } from "express";
import { getGameList, getGameDetail } from "../services";

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
