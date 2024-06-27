import dayjs from "dayjs";
import schedule from "node-schedule";
import { log } from "../utils";
import { deleteUser } from "./user.service";

const scheduledJobs = new Map();

export const scheduleAccountDeletion = (id: number) => {
  const deleteDate = dayjs().add(14, "d").toDate();

  const job = schedule.scheduleJob(deleteDate, async () => {
    const deletedUser = await deleteUser(id);
    if (!deletedUser) {
      log.error(`Unable to delete user with id: ${id}`);
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
