import config from "config";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { NextFunction, Request, Response } from "express";
import {
  log,
  signJwt,
  sendEmail,
  verifyJwt,
  createHash,
  accessTokenCookieOptions,
} from "../utils";
import {
  LoginUserInput,
  VerifyEmailInput,
  ForgotPasswordInput,
} from "../schema";
import {
  signToken,
  createUser,
  getUserById,
  getUserByEmail,
  getAndUpdateUser,
  getUserLastLogin,
  createVerificationCode,
  getUserByEmailOrUsername,
} from "../services";
import { User } from "../models";
import { redisCLI } from "../clients";
import { EMAIL_PROVIDER } from "../constants";
import { AppConfigs, TokensConfigs, UserParams } from "../types";

dayjs.extend(utc);
const { clientUrl } = config.get<AppConfigs>("appConfigs");
const { accessTokenExpiresIn } = config.get<TokensConfigs>("tokensConfigs");

export const registerHandler = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  const existingUser = await getUserByEmailOrUsername(email, username);
  if (existingUser) {
    log.info(
      `${JSON.stringify({
        action: "register-existingUser",
        data: existingUser,
      })}`
    );
    return res.json({
      error: true,
      message: "User with the provided email or username already exists",
    });
  }

  const hash = createHash(password, email);

  const userRegistration: UserParams = {
    ...req.body,
    password: hash,
  };

  const code = createVerificationCode();
  const codeExpire = dayjs().add(180, "s");

  userRegistration["otpCode"] = code;
  userRegistration["expiredCodeAt"] = codeExpire;

  const addedToRedis = await redisCLI.set(
    `verify_email_pending_${email}`,
    JSON.stringify(userRegistration)
  );

  if (!addedToRedis) {
    return res.json({ error: true, message: "Email already registered." });
  }

  await redisCLI.expire(`verify_email_pending_${email}`, 180);

  const { fullName } = userRegistration;
  const subject = "OTP Verification Email";
  const templatePath = "OTP";
  const templateData = {
    title: subject,
    name: fullName,
    code,
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
      "An email with a verification code has been sent to your email. Please enter this code to proceed",
    data: { email, codeExpire },
  });
};

export const verifyEmailHandler = async (
  req: Request<VerifyEmailInput>,
  res: Response
) => {
  const { code } = req.body;

  let redisObj: any = await redisCLI.get(
    `verify_email_pending_${req.body.email}`
  );
  redisObj = JSON.parse(redisObj);
  if (!redisObj) {
    return res.json({ error: true, message: "Confirmation time expired!" });
  }

  const { email, otpCode, expiredCodeAt } = redisObj;
  if (code !== otpCode) {
    return res.json({ error: true, message: "Confirmation code incorrect!" });
  }

  const currentDateTime = dayjs();
  const expiresAtDateTime = dayjs(expiredCodeAt);
  const isExpired = currentDateTime.isAfter(expiresAtDateTime);

  if (isExpired) {
    log.error(`${JSON.stringify({ action: "expired User", data: redisObj })}`);
    return res.json({
      error: true,
      message: "Your OTP code has expired. Please request a new OTP code",
    });
  } // nuk duhet

  const existingUser = await getUserByEmail(email);
  let user;
  let verified = true;

  if (existingUser) {
    user = await getAndUpdateUser(existingUser.id, { verified });
    if (!user) {
      log.error(
        JSON.stringify({ action: "Confirm updateUser Req", data: user })
      );
      return res.json({ error: true, message: "Failed to update user!" });
    }
  } else {
    user = await createUser(redisObj, verified);
    if (!user) {
      log.error(
        JSON.stringify({ action: "Confirm createUser Req", data: user })
      );
      return res.json({ error: true, message: "Failed to register user!" });
    }
  }

  await redisCLI.del(`verify_email_pending_${email}`);

  res.json({
    error: false,
    message: "Congratulation! Your account has been created.",
  });
};

export const loginHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response
) => {
  const { identifier, password, remember } = req.body;

  const user = await getUserByEmailOrUsername(identifier, identifier);
  if (!user) {
    return res.json({
      error: true,
      message: "Invalid Password! Please enter valid password.",
    });
  }

  if (user && user.provider !== EMAIL_PROVIDER.email) {
    return res.json({
      error: true,
      message: `That email address is already in use using ${user.provider} provider.`,
    });
  }

  const expectedHash = createHash(password, user.email);
  if (user.password !== expectedHash) {
    return res.json({
      error: true,
      message: "Invalid Password! Please enter valid password.",
    });
  }

  if (!user.verified) {
    const code = createVerificationCode();

    const user_registration = {
      otpCode: code,
      expiredCodeAt: dayjs().add(60, "s"),
    };

    const addedToRedis = await redisCLI.set(
      `verify_email_pending_${user.email}`,
      JSON.stringify(user_registration)
    );
    if (!addedToRedis) {
      return res.json({ error: true, message: "Email already registered." });
    }

    await redisCLI.expire(`register_pending_${user.email}`, 3600);

    const extra = JSON.parse(user.extra);
    let subject = "OTP Verification Email";
    let templatePath = "OTP";
    const templateData = {
      title: subject,
      name: `${extra.firstName} ${extra.lastName}`,
      code,
    };

    const mailSent = await sendEmail(templatePath, templateData);
    if (!mailSent) {
      return res.json({
        error: true,
        message: "There was an error sending email, please try again",
      });
    }

    return res.json({
      error: true,
      message: `Email ${user.email} not verified. An email with a verification code has been sent to your email`,
    });
  }

  const { accessToken, refreshToken } = await signToken(user, remember);

  await getUserLastLogin(user.id);

  user.password = undefined;

  res.json({
    error: false,
    message: "Login successful",
    data: { aToken: accessToken, rToken: refreshToken, user },
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
      message: "User is not Registered with us, please Sign Up to continue.",
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
      message: "User is not Registered with us, please Sign Up to continue.",
    });
  }

  await redisCLI.del(`session_${user.id}`);
  await getUserLastLogin(user.id);

  res.json({ error: false, message: "Logout success." });
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
      message: `This email: '${email}' is not register with us. Please enter a valid email.`,
    });
  }

  if (!user.verified) {
    return res.json({
      error: true,
      message: `User with email '${email}' is not verified.`,
    });
  }

  const { accessToken } = await signToken(user);
  const resetPassordUrl = `${origin}/reset-password/${user.email}/${accessToken}`;

  const addedToRedis = await redisCLI.set(
    `reset_password_pending_${user.email}`,
    JSON.stringify(user)
  );
  if (!addedToRedis) {
    return res.json({
      error: true,
      message:
        "New password waiting for confirmation. Please check your inbox!",
    });
  }
  await redisCLI.expire(`reset_password_pending_${user.email}`, 180);

  let templatePath = "ForgotPassword";
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
      "Email Sent Successfully, Please Check Your Email to Continue Further.",
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
        "Your token has expired. Please attempt to reset your password again.",
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

  const hashPass = createHash(password, email);

  const newPassword = await getAndUpdateUser(+id, { password: hashPass });
  if (!newPassword) {
    return res.json({
      error: true,
      message:
        "Something went wrong changing the password. Please try again later.",
    });
  }

  await redisCLI.del(`reset_password_pending_${email}`);

  let templatePath = "UpdatePassword";
  const templateData = {
    title: "Password Update Confirmation",
    name,
    email,
  };

  const mailSent = await sendEmail(templatePath, templateData);
  if (!mailSent) {
    return res.json({
      error: true,
      message: "Somenthing went wrong. Email not sent.",
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
