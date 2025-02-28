import config from "config";
import { Sequelize } from "sequelize";
import { DatabaseConfig } from "../../types";

const { dbHost, dbUser, dbPassword, dbName, dbDriver } =
  config.get<DatabaseConfig>("dbConfig");

export const sequelizeConnection = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: dbDriver,
  logging: false,
  define: {
    timestamps: false,
  },
  query: {
    raw: true,
  },
});
