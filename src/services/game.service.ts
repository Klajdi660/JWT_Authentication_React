import { log } from "../utils";
import { HttpClient } from "../clients";
import { GameListParams } from "../types";
import { GAME_TYPE } from "../constants";

const { GAMES, GENRES } = GAME_TYPE;

export const getGameList = async (params: object) => {
  try {
    return await HttpClient.get<GameListParams>(GAMES, params);
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "game_list_catch",
        message: "Failed to get game list",
      })
    );
  }
};

export const getGameDetails = async (gameId: string | any) => {
  try {
    return await HttpClient.get<GameListParams>(`${GAMES}/${gameId}`);
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "game_details_catch",
        message: "Failed to get game detail",
      })
    );
  }
};

export const getGameVideos = async (gameId: string | any) => {
  try {
    return await HttpClient.get<GameListParams>(`${GAMES}/${gameId}/movies`);
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "game_videos_catch",
        message: e.response.data,
      })
    );
  }
};

export const getGameImages = async (gameId: string | any) => {
  try {
    return await HttpClient.get<GameListParams>(
      `${GAMES}/${gameId}/screenshots`
    );
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "game_images_catch",
        message: e.response.data,
      })
    );
  }
};

export const getGameReviews = async (gameId: string | any) => {
  try {
    return await HttpClient.get<GameListParams>(`${GAMES}/${gameId}/reviews`);
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "game_reviews_catch",
        message: e.response.data,
      })
    );
  }
};

export const getGameGenreList = async () => {
  try {
    return await HttpClient.get<any>(GENRES);
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "game_genre_list_catch",
        message: "Failed to get game genre list",
      })
    );
  }
};

export const getGamePlatformsList = async () => {
  try {
    return await HttpClient.get<any>("platforms/lists/parents");
  } catch (e) {
    log.error(
      JSON.stringify({
        action: "game_platforms_list_catch",
        message: "Failed to get game platforms list",
      })
    );
  }
};

let cachedGameList: GameListParams[] = [];
let lastFetchTime: number = 0;
const CACHE_DURATION: number = 5 * 60 * 1000;

export const fetchGameList = async () => {
  try {
    const gameListResp = await HttpClient.get<GameListParams>(GAMES);
    if (!gameListResp) return;

    return gameListResp?.results;
  } catch (e: any) {
    log.error(
      JSON.stringify({
        action: "fetch_game_list_catch",
        message: e.response.data,
      })
    );
  }
};

const getRandomGames = (games: any) => {
  const shuffledGames = games.sort(() => 0.5 - Math.random());
  return shuffledGames.slice(0, 10);
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
