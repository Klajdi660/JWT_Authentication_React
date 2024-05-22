import { Request, Response } from "express";
import config from "config";
import axios from "axios";
import { rwgApi } from "../services";
import { log } from "../utils";
import { GameConfig } from "../types";

const { twAuthUrl, twUrl, twClientId, twClientSecret } =
  config.get<GameConfig>("gamesConfig");

export const gameListHandler = async (req: Request, res: Response) => {
  const { rwgType } = req.params;
  const { page, pageSize } = req.query;

  let params = {
    page,
    page_size: pageSize,
  };

  const pageNumber = parseInt(page as string) || 1;
  const page_size = parseInt(pageSize as string) || 50;

  const startIndex = (pageNumber - 1) * page_size;
  const endIndex = startIndex + page_size;

  const rwgResponse = await rwgApi.gameList(rwgType, params);
};
