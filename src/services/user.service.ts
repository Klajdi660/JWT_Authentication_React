import dayjs from "dayjs";
import config from "config";
import { Op } from "sequelize";
import otpGenerator from "otp-generator";
import { DocumentType } from "@typegoose/typegoose";
import { User } from "../models";
import { redisCLI } from "../clients";
import { log, signJwt, convertTZ } from "../utils";
import { TokensConfigs, UserParams } from "../types";

const {
  accessTokenExpiresIn,
  refreshTokenExpiresIn,
  rememberRefreshTokenExpiresIn,
} = config.get<TokensConfigs>("tokensConfigs");

export const getUserById = async (id: number): Promise<User | any> => {
  return User.findOne({
    where: { id },
  }).catch((error) => {
    log.error(
      `${JSON.stringify({ action: "getUserById catch", data: error })}`
    );
  });
};

export const getUserByProviderId = async (
  providerId: number
): Promise<User | any> => {
  return User.findOne({
    where: {
      extra: {
        [Op.like]: `%${providerId}%`,
      },
    },
  }).catch((error) => {
    log.error(
      `${JSON.stringify({ action: "getUserByProviderId catch", data: error })}`
    );
  });
};

export const getUserByEmail = async (email: string): Promise<User | any> => {
  return User.findOne({
    where: { email },
  }).catch((error) => {
    log.error(
      `${JSON.stringify({ action: "getUserByEmail catch", data: error })}`
    );
  });
};

export const getUserByUsername = async (
  username: string
): Promise<User | any> => {
  return User.findOne({
    where: { username },
  }).catch((error) => {
    log.error(
      `${JSON.stringify({ action: "getUserByEmail catch", data: error })}`
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

export const createUser = async (
  data: UserParams,
  verified: boolean
): Promise<User | any> => {
  const { email, username, fullName, password } = data;

  const [firstName, ...rest] = fullName.split(" ");
  const lastName = rest.join(" ");

  const extraData = {
    // name: fullName,
    firstName,
    lastName,
    gender: null,
    dateOfBirth: null,
    about: null,
    contactNumber: null,
    photo: null,
  };

  const newUser = new User({
    email,
    username,
    password,
    googleId: "",
    extra: JSON.stringify(extraData),
    verified,
  });

  return newUser.save().catch((error) => {
    log.error(`${JSON.stringify({ action: "createUser catch", data: error })}`);
  });
};

export const getAndUpdateUser = async (
  id: number,
  updatedField: { [key: string]: any }
): Promise<User | any> => {
  const currentTimestamp = dayjs().toDate();
  updatedField.updatedAt = currentTimestamp;

  return User.update(updatedField, { where: { id } }).catch((error) => {
    log.error(
      `${JSON.stringify({ action: "getAndUpdateUser catch", data: error })}`
    );
  });
};

export const deleteUser = async (id: number): Promise<User | any> => {
  return User.destroy({
    where: { id },
  }).catch((error) => {
    log.error(`${JSON.stringify({ action: "deleteUser catch", data: error })}`);
  });
};

export const createVerificationCode = () => {
  const otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: true,
    specialChars: false,
  });

  return otp;
};

export const signToken = async (
  user: DocumentType<User | any>,
  remember?: boolean
) => {
  // const refreshTokenExpiration = remember
  //   ? rememberRefreshTokenExpiresIn
  //   : refreshTokenExpiresIn;

  if (remember) {
    const saveAuthUserToken = signJwt(
      { id: user.id },
      "accessTokenPrivateKey",
      {
        // expiresIn: `${rememberRefreshTokenExpiresIn}d`,
        expiresIn: "1d",
      }
    );

    return { saveAuthUserToken };
  }

  const accessToken = signJwt({ id: user.id }, "accessTokenPrivateKey", {
    expiresIn: `${accessTokenExpiresIn}m`,
  });

  const refreshToken = signJwt({ id: user.id }, "refreshTokenPrivateKey", {
    expiresIn: `${refreshTokenExpiresIn}d`,
  });

  // You may want to save the refreshToken in the database or a persistent store
  await saveRefreshToken(user.id, refreshToken);

  // Create a Session
  await redisCLI.set(`session_${user.id}`, JSON.stringify(user), {
    EX: 60 * 60,
  });
  await redisCLI.expire(`session_${user.id}`, 3600);

  return { accessToken, refreshToken };
};

export const getUserLastLogin = async (id: number) => {
  const currentTimestamp = dayjs().toDate();

  let { date, time } = convertTZ(currentTimestamp);
  const lastLogin = `${date} ${time}`;

  await getAndUpdateUser(id, { lastLogin });
  return;
};

const saveRefreshToken = async (userId: string, token: string) => {
  await redisCLI.set(`refreshToken_${userId}`, token);
  await redisCLI.expire(
    `refreshToken_${userId}`,
    dayjs().add(30, "days").unix()
  );
};
