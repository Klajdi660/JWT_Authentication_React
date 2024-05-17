import axios from "axios";
import config from "config";
import { log } from "../utils";
import { GameConfig } from "../types";

const { twAuthUrl, twClientId, twClientSecret } =
  config.get<GameConfig>("gamesConfig");

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
