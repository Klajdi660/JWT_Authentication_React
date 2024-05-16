import config from "config";
// import mongoose from "mongoose";
import { Sequelize } from "sequelize";
// import { log } from "../../utils";
import { DatabaseConfig } from "../../types";

const {
  //   dbUrl,
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
} = config.get<DatabaseConfig>("mysql");
// } = config.get<DatabaseConfig>("database");

const dbDriver = "mysql";

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

// export const connectDB = async () => {
//   try {
//     await mongoose.connect(dbUrl);
//     log.info(
//       `${JSON.stringify({
//         action: "Database Run",
//         message: "Database connection has been established successfully.",
//       })}`
//     );
//   } catch (error: any) {
//     log.error(
//       `${JSON.stringify({
//         action: "connectDB Catch",
//         messsage: `Cannot connect to the database: ${error.message}`,
//       })}`
//     );
//     setTimeout(connectDB, 5000);
//   }
// };
