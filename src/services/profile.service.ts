import dayjs from "dayjs";
import schedule from "node-schedule";
import { UploadApiOptions, v2 as cloudinary } from "cloudinary";
import { log } from "../utils";
import { deleteUser } from "./user.service";

const scheduledJobs = new Map();

export const scheduleAccountDeletion = (id: number) => {
  const deleteDate = dayjs().add(14, "d").toDate();

  const job = schedule.scheduleJob(deleteDate, async () => {
    const deletedUser = await deleteUser(id);
    if (!deletedUser) {
      log.error(
        JSON.stringify({
          action: "schedule_account_deletion_error",
          message: `Unable to delete user with id: ${id}`,
        })
      );
    }

    scheduledJobs.delete(id);
  });

  scheduledJobs.set(id, job);

  const daysDifference = dayjs(deleteDate).diff(dayjs(), "day");

  return { daysDifference };
};

export const cancelAccountDeletion = (id: number) => {
  const job = scheduledJobs.get(id);
  if (!job) {
    return { error: true, message: "No deletion process found for this user." };
  }

  const cancelledJob = job.cancel();
  if (!cancelledJob) {
    return {
      error: true,
      message: "Unable to cancel the deletion process. Please try again later.",
    };
  }

  scheduledJobs.delete(id);

  return {
    error: false,
    message: "Account deletion process cancelled successfully.",
  };
};

export const uploadImageToCloudinary = async (
  file: any,
  folder: string,
  height: number,
  quality: number
) => {
  const options: UploadApiOptions = { folder };

  if (height) {
    options.height = height;
  }

  if (quality) {
    options.quality = quality;
  }

  options.resourceType = "auto";

  const updateImgToCloudinary = await cloudinary.uploader.upload(
    file.tempFilePath,
    options
  );

  if (!updateImgToCloudinary) {
    log.error(
      JSON.stringify({
        action: "updated_img_to_cloudinary_error",
        message: "Error uploading image to Cloudinary:",
      })
    );
    return { error: true, message: "Error uploading image to Cloudinary" };
  }

  return updateImgToCloudinary;
};

export const removeImageFromCloudinary = async (avatar: string | any) => {
  const publicId = avatar.split("/").pop()?.split(".")[0];

  const removeImg = await cloudinary.uploader.destroy(publicId);

  return removeImg;
};
