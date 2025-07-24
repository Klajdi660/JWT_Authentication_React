import {
  EmailProvidersParams,
  GameTypeParams,
  RedisNameParams,
  RoleParams,
} from "../types";

export const ROLES: RoleParams = {
  Admin: "admin",
  User: "user",
  Guest: "guest",
  Merchant: "merchant",
};

export const EMAIL_PROVIDERS: EmailProvidersParams = {
  Email: "email",
  Google: "google",
  Facebook: "facebook",
};

export const GAME_TYPE: GameTypeParams = {
  GAMES: "games",
  GENRES: "genres",
};

export const REDIS_NAME: RedisNameParams = {
  VERIFY_USER: "verify_user",
};
