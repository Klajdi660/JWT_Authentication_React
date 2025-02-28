import { Dialect } from "sequelize";
export interface AppConfigs {
  port: number;
  prefix: string;
  clientUrl: string;
  logLevel: string;
}

export interface GoogleConfigs {
  googleClientId: string;
  googleClientSecret: string;
  googleOauthCallbackUrl: string;
}

export interface TokenConfig {
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  rememberRefreshTokenExpiresIn: number;
}

export interface RedisConfigs {
  redisHost: string;
  redisPort: number;
}

export interface MysqlConfigs {
  dbHost: string;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  dbDriver: Dialect;
}

export interface RWGConfigs {
  rwgUrl: string;
  rwgKey: string;
}
export interface TWConfig {
  twAuthUrl: string;
  twUrl: string;
  twClientId: string;
  twClientSecret: string;
}

export interface SmtpConfigs {
  smtpPort: number;
  smtpEmail: string;
  smtpPassword: string;
  smtpService: string;
  smtpHost: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  cloudApiKey: string;
  cloudApiSecret: string;
  cloudFolderName: string;
}
