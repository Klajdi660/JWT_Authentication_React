import { Request, Response } from "express";
import { deleteUser, getUserById, getAndUpdateUser } from "../services";

export const deleteProfileHandler = async (req: Request, res: Response) => {
  const { id } = req.params;

  const deletedUser = await deleteUser(+id);
  if (!deletedUser) {
    return res.json({ error: true, message: "Unable to delete your profile!" });
  }

  res.json({ error: false, message: "Your profile deleted successfully" });
};

export const updateProfileHandler = async (req: Request, res: Response) => {
  // const { id } = req.params;
  const updates = req.body;
  const { user } = res.locals;

  // const user = await getUserById(+id);
  // if (!user) {
  //     return res.json({ error: true, message: "User not found!" });
  // };

  const { extra, ...userUpdates } = updates;

  Object.assign(user, userUpdates);

  // const extraData = { ...JSON.parse(user.extra || '{}'), ...extra };
  const extraData = Object.assign({}, JSON.parse(user.extra || "{}"), extra);

  const updatedProfileUser = await getAndUpdateUser(user.id, {
    ...user,
    extra: JSON.stringify(extraData),
  });
  if (!updatedProfileUser) {
    return res.json({
      error: true,
      message: "Profile not updated. Please try again later.",
    });
  }

  const updatedUser = await getUserById(user.id);

  res.json({
    error: false,
    message: "Profile updated successfully!",
    data: updatedUser,
  });
};
