import dayjs from "dayjs";
import config from "config";
import { CookieOptions } from "express";
import { TokensConfigs } from "../types/configs.type";

const { accessTokenExpiresIn, refreshTokenExpiresIn } =
  config.get<TokensConfigs>("tokensConfigs");

const accessTokenExpitesAt = dayjs()
  .add(accessTokenExpiresIn, "minute")
  .toDate();
const refreshTokenExpitesAt = dayjs()
  .add(refreshTokenExpiresIn, "minute")
  .toDate();

export const accessTokenCookieOptions: CookieOptions = {
  expires: accessTokenExpitesAt,
  maxAge: accessTokenExpiresIn * 60 * 1000,
  httpOnly: true,
};

export const refreshTokenCookieOptions: CookieOptions = {
  expires: refreshTokenExpitesAt,
  maxAge: refreshTokenExpiresIn * 60 * 1000,
  httpOnly: true,
};

export const loginTokenCookieOptions = {
  ...accessTokenCookieOptions,
  httpOnly: false,
};
