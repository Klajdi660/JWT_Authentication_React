import { log } from "../utils";
import { HttpClient } from "../clients";
import { GameListParams } from "../types";

export const getGameList = async (params: object) => {
  try {
    return await HttpClient.get<GameListParams>("games", params);
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "getGameList catch",
        message: "Failed to get game list",
      })
    );
  }
};

export const getGameDetails = async (gameId: string | any) => {
  try {
    return await HttpClient.get<GameListParams>(`games/${gameId}`);
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "getGameDetails catch",
        message: "Failed to get game detail",
      })
    );
  }
};

export const getGameVideos = async (gameId: string | any) => {
  try {
    return await HttpClient.get<GameListParams>(`games/${gameId}/movies`);
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "getGameVideos catch",
        message: e.response.data,
      })
    );
  }
};

export const getGameImages = async (gameId: string | any) => {
  try {
    return await HttpClient.get<GameListParams>(`games/${gameId}/screenshots`);
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "getGameImages catch",
        message: e.response.data,
      })
    );
  }
};

export const getGameReviews = async (gameId: string | any) => {
  try {
    return await HttpClient.get<GameListParams>(`games/${gameId}/reviews`);
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "getGameReviews catch",
        message: e.response.data,
      })
    );
  }
};

let cachedGameList: GameListParams[] = [];
let lastFetchTime: number = 0;
const CACHE_DURATION: number = 5 * 60 * 1000;

export const fetchGameList = async () => {
  try {
    const gameListResp = await HttpClient.get<GameListParams>("games");
    if (!gameListResp) return;

    return gameListResp?.results;
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "getGameList catch",
        message: e.response.data,
      })
    );
  }
};

const getRandomGames = (games: any) => {
  const shuffledGames = games.sort(() => 0.5 - Math.random());
  return shuffledGames.slice(0, 6);
};

const refreshGameList = async () => {
  const gameList = await fetchGameList();

  if (!gameList) return null;

  if (gameList.length > 0) {
    cachedGameList = getRandomGames(gameList);
    lastFetchTime = Date.now();
  }
};

export const getGamesSliderList = async () => {
  const currentTime = Date.now();

  if (
    currentTime - lastFetchTime > CACHE_DURATION ||
    cachedGameList.length === 0
  ) {
    await refreshGameList();
  }

  return cachedGameList;
};

export const getGameGenreList = async () => {
  try {
    return await HttpClient.get<any>("genres");
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "getGameGenreList catch",
        message: "Failed to get game genre list",
      })
    );
  }
};

export const getGamePlatformList = async () => {
  try {
    return await HttpClient.get<any>("platforms/lists/parents");
  } catch (e) {
    log.error(
      JSON.stringify({
        action: "getGamePlatformList catch",
        message: "Failed to get game platform list",
      })
    );
  }
};
