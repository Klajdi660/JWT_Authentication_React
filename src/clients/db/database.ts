import config from "config";
import { Sequelize } from "sequelize";
import { DatabaseConfig } from "../../types";

const {
  //   dbUrl,
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  dbDriver,
} = config.get<DatabaseConfig>("mysql");

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
