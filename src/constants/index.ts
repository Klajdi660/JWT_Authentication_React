import { RoleParams, EmailProvidersParams, GameTypeParams } from "../types";

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
