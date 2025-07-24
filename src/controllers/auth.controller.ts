import config from "config";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { NextFunction, Request, Response } from "express";
import {
  accessTokenCookieOptions,
  createHash,
  sendEmail,
  sendSms,
  signJwt,
  verifyJwt,
} from "../utils";
import { ForgotPasswordInput, LoginHelpInput, LoginUserInput } from "../schema";
import {
  createVerificationCode,
  getUserByEmail,
  getUserByEmailOrPhoneNr,
  getUserByEmailOrUsernameOrPhoneNr,
  getUserById,
  getUserLastLogin,
  signToken,
  updateUser,
} from "../services";
import { User } from "../models";
import { redisCLI } from "../clients";
import { EMAIL_PROVIDERS } from "../constants";
import { AppConfigs, TokensConfigs } from "../types";

dayjs.extend(utc);
const { clientUrl } = config.get<AppConfigs>("appConfigs");
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

  user.password = undefined;

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
    data: { aToken: accessToken, rToken: refreshToken, user },
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

  const { username } = user;
  const { firstName, lastName } = JSON.parse(user.extra);
  user.password = undefined;

  const code = createVerificationCode();
  const addedToRedis = await redisCLI.set(
    `${action}_${username}`,
    JSON.stringify({ username, otpCode: code })
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
      message:
        "An sms with a verification code has been sent to your mobile, please enter this code to proceed",
      data: user,
    });
  }

  const subject = "User Verification";
  const templatePath = "otp";
  const templateData = {
    title: subject,
    name: `${firstName} ${lastName}`,
    code,
  };

  const mailSent = await sendEmail(templatePath, templateData);
  if (!mailSent) {
    return res.json({
      error: true,
      message: "There was an error sending email, please try again later",
    });
  }

  console.log("object :>> ", {
    error: false,
    message:
      "An email with a verification code has been sent to your email, please enter this code to proceed",
    data: user,
  });

  return res.json({
    error: false,
    message:
      "An email with a verification code has been sent to your email, please enter this code to proceed",
    data: user,
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

  user.password = undefined;

  res.json({
    error: false,
    message: "Login successful",
    data: {
      aToken: accessToken,
      rToken: refreshToken,
      user,
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

export const forgotPasswordHandler = async (
  req: Request<{}, {}, ForgotPasswordInput>,
  res: Response
) => {
  const { email } = req.body;

  const user = await getUserByEmail(email);
  if (!user) {
    return res.json({
      error: true,
      message: `This user is not register with us, please enter a valid user`,
    });
  }

  if (!user.verified) {
    return res.json({
      error: true,
      message: `This user is not verified`,
    });
  }

  const { accessToken } = await signToken(user);
  const resetPassordUrl = `${clientUrl}/reset-password/${user.email}/${accessToken}`;

  const addedToRedis = await redisCLI.set(
    `reset_password_pending_${user.email}`,
    JSON.stringify(user)
  );
  if (!addedToRedis) {
    return res.json({
      error: true,
      message: "New password waiting for confirmation, please check your inbox",
    });
  }
  await redisCLI.expire(`reset_password_pending_${user.email}`, 60);

  let templatePath = "forgotPassword";
  const name = JSON.parse(user.extra).name;
  const templateData = {
    title: "Reset Password",
    url: resetPassordUrl,
    name,
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
      "Email sent successfully, please check your email to continue further",
  });
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  const { hash, email } = req.query;
  const { password } = req.body;

  let redisObj: any = await redisCLI.get(`reset_password_pending_${email}`);
  redisObj = JSON.parse(redisObj);
  if (!redisObj) {
    return res.json({
      error: true,
      message:
        "Your token has expired, please attempt to reset your password again",
    });
  }

  const { id } = redisObj;
  const parseExtra = JSON.parse(redisObj.extra);
  const { name } = parseExtra;

  const decoded = verifyJwt(hash, "accessTokenPublicKey");
  if (!decoded) {
    return res.json({
      error: true,
      message: "Invalid token or user doesn't exist",
    });
  }

  const hashPass = createHash(password);

  const newPassword = await updateUser(+id, { password: hashPass });
  if (!newPassword) {
    return res.json({
      error: true,
      message:
        "Something went wrong changing the password, please try again later",
    });
  }

  await redisCLI.del(`reset_password_pending_${email}`);

  let templatePath = "updatePassword";
  const templateData = {
    title: "Password Update Confirmation",
    name,
    email,
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

export const googleOauthHandler = async (req: Request, res: Response) => {
  const user: User | any = req.user;
  if (!user) return;

  const { accessToken, refreshToken } = await signToken(user);

  const token = {
    aToken: accessToken,
    rToken: refreshToken,
  };

  await getUserLastLogin(user.id);

  user.password = undefined;

  const params = new URLSearchParams({
    token: JSON.stringify(token),
    user: JSON.stringify(user),
  }).toString();

  res.redirect(`${clientUrl}/social-auth?${params}`);
};
