import axios from "axios";
import config from "config";
import { HttpClient } from "../clients";
import { log } from "../utils";
import { GameConfig, GameListParams } from "../types";

const { twAuthUrl, twUrl, twClientId, twClientSecret } =
  config.get<GameConfig>("gamesConfig");

interface TwAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export const rwgApi = {
  gameList: async (rwgType: string | any, params: object) =>
    await HttpClient.get<GameListParams>(rwgType, params),
};

export const getGameList = async (params: object) => {
  try {
    const gameListResp = await HttpClient.get<GameListParams>("games", params);
    return gameListResp.results;
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "getGameList catch",
        message: e.response.data,
      })
    );
  }
};

export const getTwAuthToken = async () => {
  try {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const params = {
      client_id: twClientId,
      client_secret: twClientSecret,
      grant_type: "client_credentials",
    };

    const data = await HttpClient.post<TwAuthResponse>(twAuthUrl, null, {
      headers,
      params,
    });

    return data.access_token;
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "authTwToken catch",
        message: e.response.data,
      })
    );
  }
};
