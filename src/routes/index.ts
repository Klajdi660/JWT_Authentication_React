import { Router } from "express";
import config from "config";
import authRoutes from "./auth.route";
import gameRoutes from "./game.route";
import userRoutes from "./user.route";
import profileRoutes from "./profile.route";
import { AppConfig } from "../types";

const { prefix } = config.get<AppConfig>("app");

const routes = Router();

routes.use(`${prefix}/auth`, authRoutes);
routes.use(`${prefix}/games`, gameRoutes);
routes.use(`${prefix}/user`, userRoutes);
routes.use(`${prefix}/profile`, profileRoutes);

export default routes;
