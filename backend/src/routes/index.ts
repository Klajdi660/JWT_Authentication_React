import { Router } from "express";
import config from "config";
import authRoutes from "./auth.route";
import { AppConfig } from "../types/general.type";

const { prefix } = config.get<AppConfig>("app");

const routes = Router();

routes.use(`${prefix}/auth`, authRoutes);

export default routes;
