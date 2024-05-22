import axios from "axios";
import config from "config";
import { HttpClient } from "../clients";
import { log } from "../utils";
import { GameConfig, GameListParams } from "../types";

const { twAuthUrl, twClientId, twClientSecret } =
  config.get<GameConfig>("gamesConfig");

export const rwgApi = {
  gameList: async (rwgType: string, params: object) =>
    await HttpClient.get<GameListParams>(rwgType, params),
};

export const getGameList = async () => {
  const token = await getTwAuthToken();
  if (!token) {
    return { error: true, message: "Authenticated Failed!" };
  }
};

export const getTwAuthToken = async () => {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const params = new URLSearchParams({
    client_id: twClientId,
    client_secret: twClientSecret,
    grant_type: "client_credentials",
  });

  return axios
    .post(twAuthUrl, params, { headers })
    .then((res) => res.data.access_token)
    .catch((e) => {
      log.error(
        JSON.stringify({ action: "authTwToken catch", message: e.message })
      );
      return { error: true, message: e.message };
    });
};
