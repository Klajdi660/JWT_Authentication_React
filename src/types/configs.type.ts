import { Dialect } from "sequelize";

export interface AppConfigs {
  port: number;
  prefix: string;
  logLevel: string;
  clientUrl: string;
}

export interface TokensConfigs {
  registerSecretKey: string;
  accessTokenExpiresIn: number;
  accessTokenPublicKey: string;
  refreshTokenExpiresIn: number;
  refreshTokenPublicKey: string;
  accessTokenPrivateKey: string;
  refreshTokenPrivateKey: string;
  rememberRefreshTokenExpiresIn: number;
}

export interface GoogleConfigs {
  googleClientId: string;
  googleClientSecret: string;
  googleOauthCallbackUrl: string;
}

export interface RedisConfigs {
  redisHost: string;
  redisPort: number;
}

export interface MysqlConfigs {
  dbHost: string;
  dbUser: string;
  dbName: string;
  dbDriver: Dialect;
  dbPassword: string;
}

export interface RWGConfigs {
  rwgUrl: string;
  rwgKey: string;
}
export interface TWConfig {
  twUrl: string;
  twAuthUrl: string;
  twClientId: string;
  twClientSecret: string;
}

export interface SmtpConfigs {
  smtpHost: string;
  smtpPort: number;
  smtpEmail: string;
  smtpService: string;
  smtpPassword: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  cloudApiKey: string;
  cloudApiSecret: string;
  cloudFolderName: string;
}
