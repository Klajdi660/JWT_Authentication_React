require("dotenv").config();
import cookieParser from "cookie-parser";
import path from "path";
import express, { Express, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import config from "config";
import cors from "cors";
import helmet from "helmet";
import { AppConfig } from "./types/general.type";
import routes from "./routes";
import { sequelizeConnection } from "./clients";
import { log } from "./utils";

const { port, origin, prefix } = config.get<AppConfig>("app");

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

app.use(`${prefix}/static`, express.static(path.join(__dirname, "../public")));

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(routes);
// app.use("/api/users", userRouter);
// app.use("/api/auth", authRouter);
// app.use("/api/sessions", sessionRouter);
// app.use("/api/posts", postRouter);

app.get(
  `${prefix}/healthChecker`,
  (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: "success",
      message: "Welcome to CodevoWeb😂😂👈👈",
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
          messsage: `Server is running at http://localhost:${port}`,
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
