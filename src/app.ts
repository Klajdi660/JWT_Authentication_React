require("dotenv").config();
import express, { Express, NextFunction, Request, Response } from "express";
import path from "path";
import cors from "cors";
import config from "config";
import helmet from "helmet";
import passport from "passport";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { log } from "./utils";
import routes from "./routes";
import { AppConfig } from "./types";
import { connectCloudinary, sequelizeConnection } from "./clients";
import passportConfig from "./services/session.service";

const { origin, prefix } = config.get<AppConfig>("app");
const { port } = config.get<{ port: number }>("appE");

const app: Express = express();

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

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

app.use(`${prefix}/static`, express.static(path.join(__dirname, "../public")));

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

passportConfig(passport);
connectCloudinary();

sequelizeConnection
  .authenticate()
  .then(() => {
    log.info(
      `${JSON.stringify({
        action: "Database Run",
        message: "Database connection has been established successfully.",
      })}`
    );

    app.listen(port, () => {
      log.info(
        `${JSON.stringify({
          action: "Server Run",
          messsage: `Server is running at port:${port}`,
        })}`
      );
    });
  })
  .catch((error) => {
    log.error(
      `${JSON.stringify({
        action: "Server Catch",
        messsage: "Cannot connect to the server",
        data: error,
      })}`
    );
  });
