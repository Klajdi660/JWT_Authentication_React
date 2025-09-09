import { log } from "../utils";
import { HttpClient } from "../clients";
import { GameListParams } from "../types";
import { GAME_TYPE } from "../constants";

const { GAMES, GENRES } = GAME_TYPE;

export const getGameList = async (params: object) => {
  return HttpClient.get<GameListParams>(GAMES, params).catch((e: any) => {
    log.error(
      JSON.stringify({
        action: "game_list_catch",
        message: e?.response?.data || "Failed to get game list",
      })
    );
  });
};

export const getGameDetails = async (gameId: string) => {
  return HttpClient.get<GameListParams>(`${GAMES}/${gameId}`).catch(
    (e: any) => {
      log.error(
        JSON.stringify({
          action: "game_details_catch",
          message: e?.response?.data || "Failed to get game detail",
        })
      );
    }
  );
};

export const getGameVideos = async (gameId: string) => {
  return HttpClient.get<GameListParams>(`${GAMES}/${gameId}/movies`).catch(
    (e) => {
      log.error(
        JSON.stringify({
          action: "game_videos_catch",
          message: e?.response?.data || "Failed to get game videos",
        })
      );
    }
  );
};

export const getGameImages = async (gameId: string) => {
  return HttpClient.get<GameListParams>(`${GAMES}/${gameId}/screenshots`).catch(
    (e) => {
      log.error(
        JSON.stringify({
          action: "game_images_catch",
          message: e?.response?.data || "Failed to get game images",
        })
      );
    }
  );
};

export const getGameReviews = async (gameId: string) => {
  return HttpClient.get<GameListParams>(`${GAMES}/${gameId}/reviews`).catch(
    (e) => {
      log.error(
        JSON.stringify({
          action: "game_reviews_catch",
          message: e?.response?.data || "Failed to get game reviews",
        })
      );
    }
  );
};

export const getGameGenreList = async () => {
  return HttpClient.get<any>(GENRES).catch((e) => {
    log.error(
      JSON.stringify({
        action: "game_genre_list_catch",
        message: e?.response?.data || "Failed to get game genre list",
      })
    );
  });
};

export const getGamePlatformsList = async () => {
  return HttpClient.get<any>("platforms/lists/parents").catch((e) => {
    log.error(
      JSON.stringify({
        action: "game_platforms_list_catch",
        message: e?.response?.data || "Failed to get game platforms list",
      })
    );
  });
};

let cachedGameList: GameListParams[] = [];
let lastFetchTime: number = 0;
const CACHE_DURATION: number = 5 * 60 * 1000;

export const fetchGameList = async () => {
  return HttpClient.get<GameListParams>(GAMES)
    .then((res) => res.results)
    .catch((e) => {
      log.error(
        JSON.stringify({
          action: "fetch_game_list_catch",
          message: e?.response?.data || "Failed to fetch game list",
        })
      );
    });
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
