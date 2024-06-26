import jwt, { SignOptions } from "jsonwebtoken";
import config from "config";
import { log } from "./helpFunctions";

export const signJwt = (
  payload: Object,
  key: "accessTokenPrivateKey" | "refreshTokenPrivateKey",
  options: SignOptions = {}
) => {
  const privateKey = Buffer.from(config.get<string>(key), "base64").toString(
    "ascii"
  );

  return jwt.sign(payload, privateKey, {
    ...(options && options),
    algorithm: "RS256",
  });
};

export const verifyJwt = <T>(
  token: string | any,
  key: "accessTokenPublicKey" | "refreshTokenPublicKey"
): T | null => {
  try {
    const publicKey = Buffer.from(config.get<string>(key), "base64").toString(
      "ascii"
    );

    const decoded = jwt.verify(token, publicKey) as T;
    return decoded;
  } catch (error) {
    log.error(`${JSON.stringify({ action: "verifyJWT catch", data: error })}`);
    return null;
  }
};
