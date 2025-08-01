import config from "config";
import { NextFunction, Request, Response } from "express";
import { User } from "../models";
import {
  createUser,
  createVerificationCode,
  getUserByEmailOrUsernameOrPhoneNr,
  getUserById,
  getUserByUsername,
  signToken,
  updateUser,
} from "../services";
import { createHash, log, sendEmail, sendSms } from "../utils";
import { redisCLI } from "../clients";
import { CreateUserInput, VerifyUserInput } from "../schema";
import { REDIS_NAME } from "../constants";
import { AppConfigs } from "../types";

const { VERIFY_USER, RESET_PASSWORD } = REDIS_NAME;
const { clientUrl, supportEmail } = config.get<AppConfigs>("appConfigs");

export const createUserHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response
) => {
  const { username, password, phoneNr, fullname } = req.body;

  const user = await getUserByEmailOrUsernameOrPhoneNr(req.body);
  if (user) {
    log.info(
      JSON.stringify({
        action: "existing_user",
        data: user,
      })
    );
    return res.json({
      error: true,
      errorType: "existing-user",
      message: "This user already exists, please enter another user or sign in",
    });
  }

  const hashPassword = createHash(password);
  const code = createVerificationCode();
  const newUser = {
    ...req.body,
    password: hashPassword,
    verified: false,
    otpCode: code,
  };

  const addedToRedis = await redisCLI.set(
    `${VERIFY_USER}_${username}`,
    JSON.stringify(newUser)
  );

  if (!addedToRedis) {
    return res.json({
      error: true,
      errorType: "existing-user",
      message: "User already registered, please enter another user or sign in",
    });
  }

  await redisCLI.expire(`${VERIFY_USER}_${username}`, 60);

  if (phoneNr) {
    const message = `Your GrooveIT verification code is: ${code}`;

    const smsSent = await sendSms(message, phoneNr);
    if (!smsSent) {
      return res.json({
        error: true,
        message: "There was an error sending sms, please try again",
      });
    }

    return res.json({
      error: false,
      message:
        "An sms with a verification code has been sent to your mobile, please enter this code to proceed",
    });
  }

  const subject = "User Verification";
  const templatePath = "otp";
  const templateData = {
    title: subject,
    name: fullname,
    code,
    clientUrl,
    supportEmail,
  };

  const mailSent = await sendEmail(templatePath, templateData);
  if (!mailSent) {
    return res.json({
      error: true,
      message: "There was an error sending email, please try again",
    });
  }

  res.json({
    error: false,
    message:
      "An email with a verification code has been sent to your email, please enter this code to proceed",
  });
};

export const verfyUserHandler = async (
  req: Request<VerifyUserInput>,
  res: Response
) => {
  const { code, username } = req.body;

  const redisData = await redisCLI.get(`${VERIFY_USER}_${username}`);
  if (!redisData) {
    return res.json({
      error: true,
      message: "Confirmation time expired, please request a new otp code",
    });
  }

  const redisObj = JSON.parse(redisData);

  if (code !== redisObj.otpCode) {
    return res.json({ error: true, message: "Confirmation code incorrect" });
  }

  const user = await getUserByUsername(username);

  redisObj.verified = true;

  const newUser = user
    ? await updateUser(user.id, { verified: true })
    : await createUser(redisObj);

  if (!newUser) {
    const action = user
      ? "verify_user_updated_error"
      : "verify_user_created_error";
    const message = user ? "Failed to verify user" : "Failed to create user";
    const data = user || redisObj;

    log.error(JSON.stringify({ action, data }));
    return res.json({ error: true, message });
  }

  await redisCLI.del(`${VERIFY_USER}_${username}`);

  const message = user
    ? "Congratulations, your account has been verified"
    : "Congratulations, your account has been created";

  res.json({ error: false, message });
};

export const verifyCodeHandler = async (req: Request, res: Response) => {
  const { code, username, action } = req.body;

  const redisData = await redisCLI.get(`${action}_${username}`);
  if (!redisData) {
    return res.json({
      error: true,
      errorType: "code-expired",
      message: "Confirmation time expired, please request a new otp code",
    });
  }

  const redisObj = JSON.parse(redisData);

  if (code !== redisObj.otpCode) {
    return res.json({ error: true, message: "Confirmation code incorrect" });
  }

  await redisCLI.del(`${action}_${username}`);

  const resetPasswordRedisData = await redisCLI.set(
    `${RESET_PASSWORD}_${username}`,
    JSON.stringify({ user: redisObj.user })
  );
  if (!resetPasswordRedisData) {
    return res.json({
      error: true,
      message: "Something went wrong, please try again later",
    });
  }

  return res.json({ error: false, message: "OK" });
};

export const resendCodeHandler = async (req: Request, res: Response) => {
  const { action, username, phoneNr, fullname } = req.body;

  const code = createVerificationCode();

  const addedToRedis = await redisCLI.set(
    `${action}_${username}`,
    JSON.stringify({ username, otpCode: code })
  );

  if (!addedToRedis) {
    return res.json({
      error: true,
      message: "Code not send, please try again",
    });
  }

  await redisCLI.expire(`${action}_${username}`, 60);

  if (phoneNr) {
    const message = `Your GrooveIT verification code is: ${code}`;

    const smsSent = await sendSms(message, phoneNr);
    if (!smsSent) {
      return res.json({
        error: true,
        message: "There was an error sending sms, please try again",
      });
    }

    return res.json({
      error: false,
      message:
        "An sms with a verification code has been sent to your mobile, please enter this code to proceed",
    });
  }

  const subject = "User Verification";
  const templatePath = "otp";
  const templateData = {
    title: subject,
    name: fullname,
    code,
    clientUrl,
    supportEmail,
  };

  const mailSent = await sendEmail(templatePath, templateData);
  if (!mailSent) {
    return res.json({
      error: true,
      message: "There was an error sending email, please try again",
    });
  }

  res.json({
    error: false,
    message:
      "An email with a verification code has been sent to your email, please enter this code to proceed",
  });
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  const { password, username } = req.body;

  const redisData = await redisCLI.get(`${RESET_PASSWORD}_${username}`);
  if (!redisData) {
    return res.json({
      error: true,
      message:
        "Something went wrong, please attempt to reset your password again",
    });
  }

  const redisObj = JSON.parse(redisData);
  const { id, email, extra } = redisObj.user;
  const { firstName, lastName, phoneNr } = JSON.parse(extra);

  const hashPassword = createHash(password);

  const newPassword = await updateUser(+id, { password: hashPassword });
  if (!newPassword) {
    return res.json({
      error: true,
      message:
        "Something went wrong changing the password, please try again later",
    });
  }

  await redisCLI.del(`${RESET_PASSWORD}_${username}`);

  let templatePath = "updatePassword";
  const templateData = {
    title: "Password Update Confirmation",
    name: `${firstName} ${lastName}`,
    identifier: email || phoneNr,
    clientUrl,
    supportEmail,
  };

  const mailSent = await sendEmail(templatePath, templateData);
  if (!mailSent) {
    return res.json({
      error: true,
      message: "Somenthing went wrong, email not sent",
    });
  }

  res.json({
    error: false,
    message:
      "Password data successfully updated, please login with your new credentials",
  });
};

export const getUserByUsernameHandler = async (req: Request, res: Response) => {
  const { username } = req.params;

  const user = await getUserByUsername(username);
  if (user) {
    return res.json({
      error: true,
      message: "This username exists, please choose another username",
    });
  }

  return;
};

export const getUserDetailsHandler = async (req: Request, res: Response) => {
  const { id } = req.params;

  let user = await getUserById(+id);
  if (!user) {
    return res.json({
      error: true,
      message: "User does not exist in our database",
    });
  }

  user.password = undefined;

  res.json({ error: false, data: user });
};

export const getUsersListHandler = async (req: Request, res: Response) => {
  const { page, limit } = req.query;

  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;

  const offset = (parsedPage - 1) * parsedLimit;

  const { rows: users, count: totalUsers } = await User.findAndCountAll({
    limit: parsedLimit,
    offset,
    order: [["id", "ASC"]], // sorted by id (1, 2, ...)
  });

  const totalPages = Math.ceil(totalUsers / parsedLimit);

  res.json({
    error: false,
    data: {
      users,
      totalPages,
      currentPage: parsedPage,
      totalUsers,
    },
  });
};

export const saveAuthUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { remember } = req.body;
  const { user } = res.locals;

  const { saveAuthUserToken } = await signToken(user, remember);

  user.password = undefined;

  res.json({
    error: false,
    message: "Save auth user successful",
    data: {
      saveAuthUserToken,
      user,
    },
  });
};
