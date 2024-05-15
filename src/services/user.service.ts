import config from "config";
import otpGenerator from "otp-generator";
import { DocumentType } from "@typegoose/typegoose";
import { Op } from "sequelize";
import { User } from "../models";
import { log, signJwt } from "../utils";
import { OtpConfig, TokenConfig } from "../types";
import { redisCLI } from "../clients";

const { otpLength, otpConfig } = config.get<OtpConfig>("otp");
const { accessTokenExpiresIn, refreshTokenExpiresIn } =
  config.get<TokenConfig>("token");

export const getUserById = async (id: number): Promise<User | any> => {
  return User.findOne({
    where: { id },
  }).catch((error) => {
    log.error(
      `${JSON.stringify({ action: "getUserById catch", data: error })}`
    );
  });
};

export const getUserByEmailOrUsername = async (
  email: string,
  username: string
): Promise<User | any> => {
  return User.findOne({
    where: {
      [Op.or]: [{ email }, { username }],
    },
  }).catch((error) => {
    log.error(
      `${JSON.stringify({
        action: "getUserByEmailOrUsername catch",
        data: error,
      })}`
    );
  });
};

export const createVerificationCode = () => {
  const otp = otpGenerator.generate(otpLength, {
    ...otpConfig,
  });

  return otp;
};

export const signToken = async (user: DocumentType<User>) => {
  const access_token = signJwt({ id: user.id }, "accessTokenPrivateKey", {
    expiresIn: `${accessTokenExpiresIn}m`,
  });

  const refresh_token = signJwt({ id: user.id }, "refreshTokenPrivateKey", {
    expiresIn: `${refreshTokenExpiresIn}m`,
  });

  // Create a Session
  await redisCLI.set(`session_${user.id}`, JSON.stringify(user), {
    EX: 60 * 60,
  });
  await redisCLI.expire(`session_${user.id}`, 3600);

  return { access_token, refresh_token };
};
