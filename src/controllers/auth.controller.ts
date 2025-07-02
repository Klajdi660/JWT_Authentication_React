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
  sendSms,
} from "../utils";
import {
  LoginUserInput,
  RegisterConfirmInput,
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
  getUserByEmailOrUsernameOrMobile,
  getUserByUsername,
} from "../services";
import { User } from "../models";
import { redisCLI } from "../clients";
import { EMAIL_PROVIDERS } from "../constants";
import { AppConfigs, TokensConfigs, NewUserParams } from "../types";

dayjs.extend(utc);
const { clientUrl } = config.get<AppConfigs>("appConfigs");
const { accessTokenExpiresIn } = config.get<TokensConfigs>("tokensConfigs");

export const registerHandler = async (req: Request, res: Response) => {
  const { username, password, phoneNumber, fullname } = req.body;

  const user = await getUserByEmailOrUsernameOrMobile(req.body);
  if (user) {
    log.info(
      JSON.stringify({
        action: "existing_user",
        data: user,
      })
    );
    return res.json({
      error: true,
      message: "This user already exists, please enter another user",
    });
  }

  const hash = createHash(password);

  const newUser: NewUserParams = {
    ...req.body,
    password: hash,
  };

  const code = createVerificationCode();
  const codeExpire = dayjs().add(180, "s");

  newUser["otpCode"] = code;
  newUser["expiredCodeAt"] = codeExpire;

  const addedToRedis = await redisCLI.set(
    `register_confirm_${username}`,
    JSON.stringify(newUser)
  );

  if (!addedToRedis) {
    return res.json({ error: true, message: "User already registered" });
  }

  await redisCLI.expire(`register_confirm_${username}`, 180);

  if (phoneNumber) {
    const message = `Your GrooveIT verification code is: ${code}`;

    const smsSent = await sendSms(message, phoneNumber);
    // if (!smsSent) {
    //   return res.json({
    //     error: true,
    //     message: "There was an error sending sms, please try again",
    //   });
    // }

    return res.json({
      error: false,
      message:
        "An sms with a verification code has been sent to your mobile. Please enter this code to proceed",
      data: { username, codeExpire },
    });
  }

  const subject = "OTP Verification Email";
  const templatePath = "OTP";
  const templateData = {
    title: subject,
    name: fullname,
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
    data: { username, codeExpire },
  });
};

export const registerConfirmHandler = async (
  req: Request<RegisterConfirmInput>,
  res: Response
) => {
  const { code, username } = req.body;

  let redisObj: any = await redisCLI.get(`register_confirm_${username}`);
  redisObj = JSON.parse(redisObj);
  if (!redisObj) {
    return res.json({ error: true, message: "Confirmation time expired!" });
  }

  const { otpCode, expiredCodeAt } = redisObj;
  if (code !== otpCode) {
    return res.json({ error: true, message: "Confirmation code incorrect!" });
  }

  const currentDateTime = dayjs();
  const expiresAtDateTime = dayjs(expiredCodeAt);
  const isExpired = currentDateTime.isAfter(expiresAtDateTime);

  if (isExpired) {
    log.error(`${JSON.stringify({ action: "expired_user", data: redisObj })}`);
    return res.json({
      error: true,
      message: "Your OTP code has expired. Please request a new OTP code",
    });
  } // nuk duhet

  const verified = true;
  const user = await getUserByUsername(username);

  const newUser = user
    ? await getAndUpdateUser(user.id, { verified })
    : await createUser(redisObj, verified);

  if (!newUser) {
    const action = user
      ? "register_confirm_update_user_error"
      : "register_confirm_create_user_error";
    const message = user ? "Failed to update user" : "Failed to create user";
    const data = user || redisObj;

    log.error(JSON.stringify({ action, data }));
    return res.json({ error: true, message });
  }

  // const existingUser = await getUserByEmail(email);
  // let user;
  // let verified = true;

  // if (existingUser) {
  //   user = await getAndUpdateUser(existingUser.id, { verified });
  //   if (!user) {
  //     log.error(
  //       JSON.stringify({ action: "confirm_update_user_error", data: user })
  //     );
  //     return res.json({ error: true, message: "Failed to update user!" });
  //   }
  // } else {
  //   user = await createUser(redisObj, verified);
  //   if (!user) {
  //     log.error(
  //       JSON.stringify({ action: "confirm_create_user_error", data: user })
  //     );
  //     return res.json({ error: true, message: "Failed to register user!" });
  //   }
  // }

  await redisCLI.del(`register_confirm_${username}`);

  res.json({
    error: false,
    message: "Congratulation, your account has been created",
  });
};

export const loginHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response
) => {
  const { password, remember } = req.body;

  const user = await getUserByEmailOrUsernameOrMobile(req.body);
  if (!user) {
    return res.json({
      error: true,
      message:
        "Sorry, we can't find an account with this credentials, please try again or create a new account",
    });
  }

  if (user && user.provider !== EMAIL_PROVIDERS.Email) {
    return res.json({
      error: true,
      message: `This user is already in use using ${user.provider} provider`,
    });
  }

  const hash = createHash(password);
  if (user.password !== hash) {
    return res.json({
      error: true,
      message: "Invalid password, please enter valid password",
    });
  }

  if (!user.verified) {
    const code = createVerificationCode();

    const user_registration = {
      otpCode: code,
      expiredCodeAt: dayjs().add(60, "s"),
    };

    const addedToRedis = await redisCLI.set(
      `register_confirm_${user.username}`,
      JSON.stringify(user_registration)
    );
    if (!addedToRedis) {
      return res.json({ error: true, message: "User already registered" });
    }

    await redisCLI.expire(`register_confirm_${user.username}`, 3600);

    const extra = JSON.parse(user.extra);
    let subject = "OTP Verification User";
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

  // await getUserLastLogin(user.id);

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
  const resetPassordUrl = `${clientUrl}/reset-password/${user.email}/${accessToken}`;

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

  const hashPass = createHash(password);

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
