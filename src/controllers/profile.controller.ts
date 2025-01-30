import { Request, Response } from "express";
import config from "config";
import dayjs from "dayjs";
import { UploadApiResponse } from "cloudinary";
import {
  getUserById,
  getAndUpdateUser,
  scheduleAccountDeletion,
  cancelAccountDeletion,
  getUserByUsername,
  uploadImageToCloudinary,
  removeImageFromCloudinary,
} from "../services";
import { CloudinaryConfig } from "../types";
import { createHash, log } from "../utils";

const { cloudFolderName } = config.get<CloudinaryConfig>("cloudinaryConfig");

export const changeUsernameHandler = async (req: Request, res: Response) => {
  const { username } = req.body;
  const { user } = res.locals;

  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    return res.json({
      error: true,
      message:
        "User with this username exists, please choose another username.",
    });
  }

  // const twoWeeksAgo = dayjs().subtract(2, "week");
  // const lastUsernameChange = user.updatedAt ? dayjs(user.updatedAt) : dayjs(0);
  // if (lastUsernameChange.isAfter(twoWeeksAgo)) {
  //   return res.json({
  //     error: true,
  //     message:
  //       "You cannot change your username again for 2 weeks after confirming this change.",
  //   });
  // }

  const updateUser = await getAndUpdateUser(user.id, { username });
  if (!updateUser) {
    return res.json({
      error: true,
      message:
        "Something went wrong changing the username. Please try again later.",
    });
  }

  const newUser = await getUserById(user.id);
  newUser.password = undefined;

  res.json({
    error: false,
    message: "Username changed successfully.",
    data: newUser,
  });
};

export const changePasswordHandler = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const { user } = res.locals;

  const { id, email, extra } = user;
  // const parseExtra = JSON.parse(extra);
  // const { name } = parseExtra;

  const expectedHash = createHash(currentPassword, user.email);
  if (user.password !== expectedHash) {
    return res.json({
      error: true,
      message: "The password is incorrect. Please enter the correct password.",
    });
  }

  const hash = createHash(newPassword, email);
  const newPasswordResp = await getAndUpdateUser(+id, { password: hash });
  if (!newPasswordResp) {
    return res.json({
      error: true,
      message:
        "Something went wrong changing the password. Please try again later.",
    });
  }

  // let templatePath = "UpdatePassword";
  // const templateData = {
  //   title: "Password Update Confirmation",
  //   name,
  //   email,
  // };

  // const mailSent = await sendEmail(templatePath, templateData);
  // if (!mailSent) {
  //   return res.json({
  //     error: true,
  //     message: "Somenthing went wrong. Email not sent.",
  //   });
  // }

  res.json({ error: false, message: "Password changed successfully." });
};

export const deleteAccountHandler = async (req: Request, res: Response) => {
  const { confirmDelete } = req.body;
  const { user } = res.locals;

  if (confirmDelete !== "delete") {
    return res.json({
      error: true,
      message: "Please type 'delete' to confirm account deletion.",
    });
  }

  const { daysDifference } = scheduleAccountDeletion(user.id);

  res.json({
    error: false,
    message: "Your profile will be deleted in 14 days.",
    data: { daysDifference },
  });
};

export const cancelDeletionHandler = async (req: Request, res: Response) => {
  const { user } = res.locals;

  const { error, message } = cancelAccountDeletion(user.id);
  if (error) {
    return res.json({ error: true, message });
  }

  res.json({ error: false, message });
};

export const updateProfileHandler = async (req: Request, res: Response) => {
  const updates = req.body;
  const { user } = res.locals;

  // const { extra } = updates;

  const extraData = { ...JSON.parse(user.extra || "{}"), ...updates };
  // const extraData = Object.assign({}, JSON.parse(user.extra || "{}"), extra);

  const updatedProfileUser = await getAndUpdateUser(user.id, {
    extra: JSON.stringify(extraData),
  });
  if (!updatedProfileUser) {
    return res.json({
      error: true,
      message: "Profile not updated. Please try again later.",
    });
  }

  const updatedUser = await getUserById(user.id);
  updatedUser.password = undefined;
  console.log("updatedUser :>> ", updatedUser);
  res.json({
    error: false,
    message: "Profile updated successfully!",
    data: updatedUser,
  });
};

export const updateDisplayPictureHandler = async (
  req: Request,
  res: Response
) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    log.error(
      JSON.stringify({
        action: "Error ploading file",
        message: "No files were uploaded.",
      })
    );
    return res.status(400).send("No files were uploaded.");
  }

  const { user } = res.locals;
  const { displayPicture } = req.files;

  const image = (await uploadImageToCloudinary(
    displayPicture,
    cloudFolderName,
    1000,
    1000
  )) as UploadApiResponse;

  const extraData = JSON.parse(user.extra || "{}");

  extraData.avatar = image.secure_url;

  const updatedProfileUser = await getAndUpdateUser(user.id, {
    extra: JSON.stringify(extraData),
  });
  if (!updatedProfileUser) {
    return res.json({
      error: true,
      message: "Profile not updated. Please try again later.",
    });
  }

  const updatedUser = await getUserById(user.id);
  updatedUser.password = undefined;

  res.json({
    error: false,
    message: "Profile updated successfully!",
    data: updatedUser,
  });
};

export const removeDisplayPictureHandler = async (
  req: Request,
  res: Response
) => {
  const { user } = res.locals;

  const extraData = JSON.parse(user.extra || "{}");

  const removedImgFromCloudinary = await removeImageFromCloudinary(
    extraData.avatar
  );

  if (!removedImgFromCloudinary) {
    return res.json({
      error: true,
      message: "Error removing image from Cloudinary.",
    });
  }

  extraData.avatar = null;

  const updatedProfileUser = await getAndUpdateUser(user.id, {
    extra: JSON.stringify(extraData),
  });

  if (!updatedProfileUser) {
    return res.status(500).json({
      error: true,
      message: "Profile not updated. Please try again later.",
    });
  }

  const updatedUser = await getUserById(user.id);
  updatedUser.password = undefined;

  res.json({
    error: false,
    message: "Profile photo removed successfully!",
    data: updatedUser,
  });
};

export const addNewCreditCardHandler = async (req: Request, res: Response) => {
  const { cardNr } = req.body;
  const { user } = res.locals;

  const existingUser = await getUserById(user.id);

  let extraData;
  try {
    extraData = existingUser.extra
      ? JSON.parse(existingUser.extra)
      : { creditCards: {} };
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Failed to parse extra data." });
  }

  if (!extraData.creditCards) {
    extraData.creditCards = {};
  }

  if (extraData.creditCards[cardNr]) {
    return res.json({
      error: true,
      message: "This card number already exists, please add another card.",
    });
  }

  extraData.creditCards[cardNr] = { ...req.body };

  await getAndUpdateUser(user.id, { extra: JSON.stringify(extraData) });

  return res.json({ success: true, message: "Card added successfully." });
};
