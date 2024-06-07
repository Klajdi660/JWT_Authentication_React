import crypto from "crypto";
import config from "config";
import dayjs from "dayjs";
import { CookieOptions, NextFunction, Request, Response } from "express";
import {
  CreateUserInput,
  LoginUserInput,
  VerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../schema";
import {
  getUserByEmail,
  getUserByEmailOrUsername,
  createUser,
  getAndUpdateUser,
  createVerificationCode,
  signToken,
  getUserById,
} from "../services";
import { redisCLI } from "../clients";
import {
  signJwt,
  verifyJwt,
  log,
  sendEmail,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
} from "../utils";
import { AppConfig, TokenConfig, UserParams } from "../types";
import { EMAIL_PROVIDER } from "../constants";

// Exclude this fields from the response
// export const excludedFields = ["password"];

const { accessTokenExpiresIn } = config.get<TokenConfig>("token");
const { origin } = config.get<AppConfig>("app");

// Only set secure to true in production
// if (process.env.NODE_ENV === "production")
//   accessTokenCookieOptions.secure = true;

export const registerHandler = async (
  // req: Request<{}, {}, CreateUserInput>,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, username, password } = req.body;

  const existingUser = await getUserByEmailOrUsername(email, username);
  if (existingUser) {
    log.info(
      `${JSON.stringify({
        action: "createUser existingUser",
        data: existingUser,
      })}`
    );
    return res.json({
      error: true,
      message: "User with the provided email or username already exists",
    });
  }

  const hash = crypto
    .createHash("sha1")
    .update(password + username)
    .digest("hex");

  const userRegistration: UserParams = {
    ...req.body,
    password: hash,
  };

  const code = createVerificationCode();
  const codeExpire = dayjs().add(180, "s");

  userRegistration["otpCode"] = code;
  userRegistration["expiredCodeAt"] = codeExpire;

  // const addedToRedis = await redisCLI.setnx(
  //   `verify_email_pending_${email}`,
  //   JSON.stringify(user_registration)
  // ); // ioredis
  const addedToRedis = await redisCLI.set(
    `verify_email_pending_${email}`,
    JSON.stringify(userRegistration)
  );

  if (!addedToRedis) {
    return res.json({ error: true, message: "Email already registered." });
  }

  await redisCLI.expire(`verify_email_pending_${email}`, 180); // 3 min

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

export const loginHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  const { identifier, password, remember } = req.body;
  console.log("remember :>> ", remember);
  const user = await getUserByEmailOrUsername(identifier, identifier);
  if (!user) {
    return res.json({
      error: true,
      message: "User is not Registered with us, please Sign Up to continue.",
    });
  }

  if (user && user.provider !== EMAIL_PROVIDER.Email) {
    return res.json({
      error: true,
      message: `That email address is already in use using ${user.provider} provider.`,
    });
  }

  const expectedHash = crypto
    .createHash("sha1")
    .update(password + user.username)
    .digest("hex");
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

  const refreshTokenExpiration = remember ? "30d" : "1d";
  const { accessToken, refreshToken } = await signToken(
    user,
    refreshTokenExpiration
  );

  // Send Access Token in Cookie
  // res.cookie("access_token", access_token, accessTokenCookieOptions);
  // res.cookie("refresh_token", refresh_token, refreshTokenCookieOptions);
  // res.cookie("logged_in", true, {
  //   ...accessTokenCookieOptions,
  //   httpOnly: false,
  // });

  res.json({
    error: false,
    message: "Login successful",
    data: { aToken: accessToken, rToken: refreshToken },
  });
};

export const verifyEmailHandler = async (
  req: Request<VerifyEmailInput>,
  res: Response,
  next: NextFunction
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
    expiresIn: `${accessTokenExpiresIn}m`,
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

const logout = (res: Response) => {
  res.cookie("access_token", "", { maxAge: 1 });
  res.cookie("refresh_token", "", { maxAge: 1 });
  res.cookie("logged_in", "", { maxAge: 1 });
};

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { user } = res.locals;
  if (!user) {
    return res.json({ error: true, message: "test" });
  }

  await redisCLI.del(`session_${user.id}`);

  logout(res);

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

  const { id, username } = redisObj;
  const parseExtra = JSON.parse(redisObj.extra);
  const { name } = parseExtra;

  const decoded = verifyJwt(hash, "accessTokenPublicKey");
  if (!decoded) {
    return res.json({
      error: true,
      message: "Invalid token or user doesn't exist",
    });
  }

  const hashPass = crypto
    .createHash("sha1")
    .update(password + username)
    .digest("hex");

  const newPassword = await getAndUpdateUser(+id, { password: hashPass });
  if (!newPassword) {
    return res.json({
      error: true,
      message: "Some Error in Updating the Password",
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
  const user = req.user;
  // const { user } = res.locals;

  const { accessToken } = await signToken(user);

  res.redirect(`${origin}/social-auth?token=${accessToken}`);
};

// export const googleOauthHandler = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // Get the code from the query
//     const code = req.query.code as string;
//     const pathUrl = (req.query.state as string) || "/";

//     if (!code) {
//       return next(new AppError("Authorization code not provided!", 401));
//     }

//     // Use the code to get the id and access tokens
//     const { id_token, access_token } = await getGoogleOauthToken({ code });

//     // Use the token to get the User
//     const { name, verified_email, email, picture } = await getGoogleUser({
//       id_token,
//       access_token,
//     });

//     // Check if user is verified
//     if (!verified_email) {
//       return next(new AppError("Google account not verified", 403));
//     }

//     // Update user if user already exist or create new user
//     const user = await findAndUpdateUser(
//       { email },
//       {
//         name,
//         photo: picture,
//         email,
//         provider: "Google",
//         verified: true,
//       },
//       { upsert: true, runValidators: false, new: true, lean: true }
//     );

//     if (!user)
//       return res.redirect(`${config.get<string>("origin")}/oauth/error`);

//     // Create access and refresh token
//     const { access_token: accessToken, refresh_token } = await signToken(user);

//     // Send cookie
//     res.cookie("access_token", accessToken, accessTokenCookieOptions);
//     res.cookie("refresh_token", refresh_token, refreshTokenCookieOptions);
//     res.cookie("logged_in", true, {
//       ...accessTokenCookieOptions,
//       httpOnly: false,
//     });

//     res.redirect(`${config.get<string>("origin")}${pathUrl}`);
//   } catch (err: any) {
// log.error(
//   JSON.stringify({
//     action: "googleOauthHandler",
//     message: "Failed to authorize Google User",
//     data: err,
//   })
// );
//     return res.redirect(`${config.get<string>("origin")}/oauth/error`);
//   }
// };

// export const githubOauthHandler = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     // Get the code from the query
//     const code = req.query.code as string;
//     const pathUrl = (req.query.state as string) ?? "/";

//     if (req.query.error) {
//       return res.redirect(`${config.get<string>("origin")}/login`);
//     }

//     if (!code) {
//       return next(new AppError("Authorization code not provided!", 401));
//     }

//     // Get the user the access_token with the code
//     const { access_token } = await getGithubOathToken({ code });

//     // Get the user with the access_token
//     const { email, avatar_url, login } = await getGithubUser({ access_token });

//     // Create new user or update user if user already exist
//     const user = await findAndUpdateUser(
//       { email },
//       {
//         email,
//         photo: avatar_url,
//         name: login,
//         provider: "GitHub",
//         verified: true,
//       },
//       { runValidators: false, new: true, upsert: true }
//     );

//     if (!user) {
//       return res.redirect(`${config.get<string>("origin")}/oauth/error`);
//     }

//     // Create access and refresh tokens
//     const { access_token: accessToken, refresh_token } = await signToken(user);

//     res.cookie("access_token", accessToken, accessTokenCookieOptions);
//     res.cookie("refresh_token", refresh_token, refreshTokenCookieOptions);
//     res.cookie("logged_in", true, {
//       ...accessTokenCookieOptions,
//       httpOnly: false,
//     });

//     res.redirect(`${config.get<string>("origin")}${pathUrl}`);
//   } catch (err: any) {
//     return res.redirect(`${config.get<string>("origin")}/oauth/error`);
//   }
// };

// export const forgotPasswordHandler = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const user = await findUser({ email: req.body.email });

//     const message =
//       "You will receive a password reset email if user with that email exist";

//     if (!user) {
//       return next(new AppError(message, 403));
//     }

//     if (!user.verified) {
//       return new AppError("User not verified", 403);
//     }

//     // Create the reset token
//     const resetToken = user.createResetToken();
//     await user.save({ validateBeforeSave: false });

//     const url = `${config.get<string>("origin")}/resetpassword/${resetToken}`;

//     try {
//       await new Email(user, url).sendPasswordResetToken();

//       return res.status(200).json({
//         status: "success",
//         message,
//       });
//     } catch (error) {
//       user.passwordResetToken = null;
//       user.passwordResetAt = null;
//       await user.save({ validateBeforeSave: false });
//       return res.status(500).json({
//         status: "error",
//         message: "There was an error sending email, please try again",
//       });
//     }
//   } catch (err: any) {
//     next(err);
//   }
// };

// export const resetPasswordHandler = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const resetToken = crypto
//       .createHash("sha256")
//       .update(req.params.resetToken)
//       .digest("hex");

//     const user = await findUser({
//       passwordResetToken: resetToken,
//       passwordResetAt: { $gt: new Date() },
//     });

//     if (!user) {
//       return next(new AppError("Token is invalid or has expired", 403));
//     }

//     user.password = req.body.password;
//     user.passwordResetToken = null;
//     user.passwordResetAt = null;
//     await user.save();

//     res.status(200).json({
//       status: "success",
//       message:
//         "Password data successfully updated, please login with your new credentials",
//     });
//   } catch (err: any) {
//     next(err);
//   }
// };
