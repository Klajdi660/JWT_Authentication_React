import config from "config";
// import { Redis } from "ioredis";
import { createClient } from "redis";
import { log } from "../../utils";
import { RedisConfig } from "../../types";

const { redisHost, redisPort } = config.get<RedisConfig>("redisFeed");

// export const redisCLI = new Redis({ host: redisHost, port: redisPort });

export const redisCLI = createClient({
  url: `redis://${redisHost}:${redisPort}`, // `redis://localhost:6379`,
});

const redisConnection = async () => {
  try {
    await redisCLI.connect();
    log.info(
      `${JSON.stringify({
        action: "Redis Run",
        message: "Redis connection has been established successfully.",
      })}`
    );
  } catch {
    (e: any) => {
      log.error(e.message);
      setTimeout(redisConnection, 5000);
    };
  }
};

redisConnection();
