import logger from "pino";
import dayjs from "dayjs";
import config from "config";
import crypto from "crypto";
import moment from "moment-timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { AppConfigs, TokensConfigs } from "../types";

dayjs.extend(customParseFormat);

const { logLevel } = config.get<AppConfigs>("appConfigs");
const { registerSecretKey } = config.get<TokensConfigs>("tokensConfigs");

export const asyncHandler = (fn: any) =>
  function asyncUtilWrap(...args: any) {
    const fnReturn = fn(...args);
    const next = args[args.length - 1];
    return Promise.resolve(fnReturn).catch(next);
  };

export const log = logger({
  transport: {
    target: "pino-pretty",
  },
  level: logLevel,
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

export const createHash = (password: string) => {
  return crypto
    .createHash("sha1")
    .update(password + registerSecretKey)
    .digest("hex");
};

export const isTokenExpired = (token: string) => {
  const hasToken = atob(token.split(".")[1]);

  if (hasToken) {
    const currentTime = dayjs().unix();
    const tokenExpirationTime = JSON.parse(token).exp;
    return currentTime > parseInt(tokenExpirationTime);
  }
  return false;
};

export const currentTimestamps = dayjs().toDate();

export const convertTZ = (
  currDate: any,
  timezone: string = "Europe/Tirane"
) => {
  const dateFormat = "DD-MM-YYYY HH:mm:ss";
  let [date, time] = moment
    .tz(currDate, timezone)
    .format(dateFormat)
    .split(" ");
  return { date, time };
};
