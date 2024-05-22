require("dotenv").config();
import express, { Express, NextFunction, Request, Response } from "express";
// import session from "express-session";
// import fileUpload from "express-fileupload";
// import SequelizeStore from "connect-session-sequelize";
import cookieParser from "cookie-parser";
import path from "path";
import morgan from "morgan";
import config from "config";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import routes from "./routes";
import { sequelizeConnection } from "./clients";
import { log } from "./utils";
import passportConfig from "../config/passport";
import { cloudinaryConnect } from "../config/cloudinary";
import { AppConfig } from "./types";

const { port, origin, prefix } = config.get<AppConfig>("app");

const app: Express = express();

// Initialize SequelizeStore for session storage
// const SequelizeSessionStore = SequelizeStore(session.Store);
// const sessionStore = new SequelizeSessionStore({
//   db: sequelizeConnection,
//   expiration: 24 * 60 * 60 * 1000,
// });

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet({ contentSecurityPolicy: false, frameguard: true }));
app.use(
  cors({
    credentials: true,
    origin: [origin],
    optionsSuccessStatus: 200,
  })
);
app.options("*", cors());
app.disable("x-powered-by");

// app.use(
//   session({
//     secret: "keyboard cat",
//     resave: false,
//     saveUninitialized: false,
//     store: sessionStore,
//   })
// );

// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/tmp",
//   })
// );

app.use(`${prefix}/static`, express.static(path.join(__dirname, "../public")));

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(routes);

app.get(
  `${prefix}/healthChecker`,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({
      error: false,
      message: "Welcome to GrooveIT😂😂👈👈",
    });
  }
);

// UnKnown Routes
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.status = err.status || "error";
  err.statusCode = err.statusCode || 500;

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

// passportConfig(passport);
// app.use(passport.initialize());
// app.use(passport.session());

// cloudinaryConnect();

// sequelizeConnection
//   .authenticate()
//   .then(() => {
//     log.info(
//       `${JSON.stringify({
//         action: "Database Run",
//         message: "Database connection has been established successfully.",
//       })}`
//     );
console.log("port :>> ", port);
app.listen(port, () => {
  log.info(
    `${JSON.stringify({
      action: "Server Run",
      messsage: `Server is running at http://localhost:${port}`,
    })}`
  );
});
// })
// .catch((error) => {
//   log.error(
//     `${JSON.stringify({
//       action: "Server Catch",
//       messsage: "Cannot connect to the server",
//       data: error,
//     })}`
//   );
// });
