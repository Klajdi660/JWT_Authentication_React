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

export const getGameList = async (page: string | any) => {
  try {
    const gameListResp = await HttpClient.get<GameListParams>("games", {
      page,
    });

    return gameListResp;
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "getGameList catch",
        message: e.response.data,
      })
    );
  }
};

export const getGameDetail = async (gameId: string | any) => {
  try {
    const gameDetailResp = await HttpClient.get<GameListParams>(
      `games/${gameId}`
    );

    return gameDetailResp;
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "getGameDetails catch",
        message: e.response.data,
      })
    );
  }
};

export const getGameVideos = async (gameId: string | any) => {
  try {
    const gameVideosResp = await HttpClient.get<GameListParams>(
      `games/${gameId}/movies`
    );

    return gameVideosResp;
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "getGameVideos catch",
        message: e.response.data,
      })
    );
  }
};

export const getGameReviews = async (gameId: string | any) => {
  try {
    const gameReviewsResp = await HttpClient.get<GameListParams>(
      `games/${gameId}/reviews`
    );

    return gameReviewsResp;
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "getGameReviews catch",
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
