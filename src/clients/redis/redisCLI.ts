import config from "config";
import { createClient } from "redis";
import { log } from "../../utils";
import { RedisConfigs } from "../../types";

const { redisHost, redisPort } = config.get<RedisConfigs>(
  "databaseConfigs.redis"
);

export const redisCLI = createClient({
  url: `redis://${redisHost}:${redisPort}`,
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
