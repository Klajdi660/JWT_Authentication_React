import dayjs from "dayjs";
import config from "config";
import { omit } from "lodash";
import utc from "dayjs/plugin/utc";
import { NextFunction, Request, Response } from "express";
import {
  accessTokenCookieOptions,
  createHash,
  excludedFields,
  sendEmail,
  sendSms,
  signJwt,
  verifyJwt,
} from "../utils";
import {
  createVerificationCode,
  getUserByEmailOrPhoneNr,
  getUserByEmailOrUsernameOrPhoneNr,
  getUserById,
  getUserLastLogin,
  signToken,
} from "../services";
import { User } from "../models";
import { redisCLI } from "../clients";
import { EMAIL_PROVIDERS } from "../constants";
import { AppConfigs, TokensConfigs } from "../types";
import { LoginHelpInput, LoginUserInput } from "../schema";

dayjs.extend(utc);
const { clientUrl, supportEmail } = config.get<AppConfigs>("appConfigs");
const { accessTokenExpiresIn } = config.get<TokensConfigs>("tokensConfigs");

export const loginHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response
) => {
  const { password } = req.body;

  const user = await getUserByEmailOrUsernameOrPhoneNr(req.body);
  if (!user) {
    return res.json({
      error: true,
      errorType: "no-account",
      message:
        "Sorry, we can't find an account with this credentials, please try again or create a new account",
    });
  }

  if (user && user.provider !== EMAIL_PROVIDERS.Email) {
    return res.json({
      error: true,
      errorTyep: "user-in-used",
      message: `This user is already in use using ${user.provider} provider`,
    });
  }

  const hash = createHash(password);
  if (user.password !== hash) {
    return res.json({
      error: true,
      errorType: "invalid-password",
      message: "Incorrect password, you can reset your password or try again",
    });
  }

  if (!user.verified) {
    return res.json({
      error: true,
      errorType: "user-not-verified",
      message: "User not verified, please verify your account to continue",
    });
  }

  const { accessToken, refreshToken } = await signToken(user);

  res.json({
    error: false,
    message: "Login successful",
    data: {
      aToken: accessToken,
      rToken: refreshToken,
      user: omit(user, excludedFields),
    },
  });
};

export const loginHelpHandler = async (
  req: Request<{}, {}, LoginHelpInput>,
  res: Response
) => {
  const { action, phoneNr } = req.body;

  const user = await getUserByEmailOrPhoneNr(req.body);
  if (!user) {
    return res.json({
      error: true,
      errorType: "no-account",
      message:
        "Sorry, we can't find an account with this credentials, please try again or create a new account",
    });
  }

  const safeUser = omit(user, excludedFields);
  const { username, verified, extra } = user;

  if (action === "forgot_password" && !verified) {
    return res.json({
      error: true,
      errorType: "user-not-verified",
      message: "User not verified, please verify your account to continue",
    });
  }

  const { firstName, lastName } = JSON.parse(extra);

  const code = createVerificationCode();
  const addedToRedis = await redisCLI.set(
    `${action}_${username}`,
    JSON.stringify({ username, user: safeUser, otpCode: code })
  );

  if (!addedToRedis) {
    return res.json({
      error: true,
      message: "Something went wrong, please try agin later",
    });
  }

  await redisCLI.expire(`${action}_${username}`, 60);

  if (phoneNr) {
    const message = `Your GrooveIT verification code is: ${code}`;

    const smsSent = await sendSms(message, phoneNr);
    if (!smsSent) {
      return res.json({
        error: true,
        message: "There was an error sending sms, please try again later",
      });
    }

    return res.json({
      error: false,
      message: `We sent a text message to ${phoneNr} with your verification code, enter it below to proceed`,
      data: safeUser,
    });
  }

  const subject = "User Verification";
  const templatePath = "otp";
  const templateData = {
    title: subject,
    name: `${firstName} ${lastName}`,
    code,
    clientUrl,
    supportEmail,
  };

  const mailSent = await sendEmail(templatePath, templateData);
  if (!mailSent) {
    return res.json({
      error: true,
      message: "There was an error sending email, please try again later",
    });
  }

  return res.json({
    error: false,
    message:
      "An email with a verification code has been sent to your email, please enter this code to proceed",
    data: safeUser,
  });
};

export const loginWithSavedUserHandler = async (
  req: Request,
  res: Response
) => {
  const { user } = res.locals;
  if (!user) {
    return res.json({
      error: true,
      message: "User is not registered with us, please sign up to continue",
    });
  }

  const { accessToken, refreshToken } = await signToken(user);

  await getUserLastLogin(user.id);

  res.json({
    error: false,
    message: "Login successful",
    data: {
      aToken: accessToken,
      rToken: refreshToken,
      user: omit(user, excludedFields),
    },
  });
};

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refresh_token = req.cookies.refresh_token as string;

  const msg = "Could not refresh access token";

  const decoded = verifyJwt<{ id: string }>(
    refresh_token,
    "refreshTokenPublicKey"
  );
  if (!decoded) {
    return next({ error: true, message: msg });
  }

  // Check if the user has a valid session
  const session = await redisCLI.get(decoded.id);
  if (!session) {
    return next({ error: true, message: msg });
  }

  // Check if the user exist
  const user = await getUserById(JSON.parse(session).id);
  if (!user) {
    return next({ error: true, message: msg });
  }

  // Sign new access token
  const atoken = signJwt({ sub: user.id }, "accessTokenPrivateKey", {
    expiresIn: `${+accessTokenExpiresIn}m`,
  });

  // Send the access token as cookie
  res.cookie("access_token", atoken, accessTokenCookieOptions);
  res.cookie("logged_in", true, {
    ...accessTokenCookieOptions,
    httpOnly: false,
  });

  res.json({
    error: false,
    data: { atoken },
  });
};

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = res.locals;
  if (!user) {
    return res.json({
      error: true,
      message: "User is not registered with us, please sign up to continue",
    });
  }

  await redisCLI.del(`session_${user.id}`);
  await getUserLastLogin(user.id);

  res.json({ error: false, message: "Logout success" });
};

export const googleOauthHandler = async (req: Request, res: Response) => {
  const user: User | any = req.user;
  if (!user) return;

  const { accessToken, refreshToken } = await signToken(user);

  const token = {
    aToken: accessToken,
    rToken: refreshToken,
  };

  await getUserLastLogin(user.id);

  const params = new URLSearchParams({
    token: JSON.stringify(token),
    user: JSON.stringify(omit(user, excludedFields)),
  }).toString();

  res.redirect(`${clientUrl}/social-auth?${params}`);
};
