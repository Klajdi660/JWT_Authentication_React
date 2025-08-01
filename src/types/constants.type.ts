export interface RoleParams {
  User: string;
  Admin: string;
  Guest: string;
  Merchant: string;
}

export interface EmailProvidersParams {
  Email: string;
  Google: string;
  Facebook: string;
}

export interface GameTypeParams {
  GAMES: string;
  GENRES: string;
}

export interface RedisNameParams {
  VERIFY_USER: string;
  RESET_PASSWORD: string;
}
