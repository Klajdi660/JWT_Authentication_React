import { NextFunction, Request, Response } from "express";
import { User } from "../models";
import { getUserById, signToken } from "../services";

export const getUserDetailsHandler = async (req: Request, res: Response) => {
  const { id } = req.params;

  let user = await getUserById(+id);
  if (!user) {
    return res.json({
      error: true,
      message: "User does not exist in our database!",
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
