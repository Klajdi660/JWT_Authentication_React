import logger from "pino";
import dayjs from "dayjs";
import config from "config";
import crypto from "crypto";

const level = config.get<string>("logLevel");

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
  level,
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
});

export const createHash = (password: string, email: string | any) => {
  return crypto
    .createHash("sha1")
    .update(password + email)
    .digest("hex");
};
