import config from "config";
import { Router } from "express";
import authRoutes from "./auth.route";
import gameRoutes from "./game.route";
import userRoutes from "./user.route";
import mailTemplateRoutes from "./mailTemplate.route";
import { AppConfigs } from "../types";
import profileRoutes from "./profile.route";

const { prefix } = config.get<AppConfigs>("appConfigs");

const routes = Router();

routes.use(`${prefix}/mail-template`, mailTemplateRoutes);

routes.use(`${prefix}/auth`, authRoutes);
routes.use(`${prefix}/user`, userRoutes);
routes.use(`${prefix}/games`, gameRoutes);
routes.use(`${prefix}/profile`, profileRoutes);

export default routes;
