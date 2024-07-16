import { Request, Response } from "express";
import { getGameList } from "../services";

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
  console.log(" gameListResp.length :>> ", gameListResp.length);
  res.json({
    error: false,
    message: "Success get games list",
    data: gameListResp,
  });
};
