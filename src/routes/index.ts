import { Router } from "express";
import config from "config";
import authRoutes from "./auth.route";
import userRoutes from "./user.route";
import { AppConfig } from "../types";

const { prefix } = config.get<AppConfig>("app");

const routes = Router();

routes.use(`${prefix}/auth`, authRoutes);
routes.use(`${prefix}/user`, userRoutes);
routes.use(`${prefix}/profile`);

export default routes;
