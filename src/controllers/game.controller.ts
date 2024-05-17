import { Request, Response } from "express";
import config from "config";
import axios from "axios";
import { log } from "../utils";
import { GameConfig } from "../types";

const { twAuthUrl, twUrl, twClientId, twClientSecret } =
  config.get<GameConfig>("gamesConfig");

export const gameListHandler = async (req: Request, res: Response) => {};
