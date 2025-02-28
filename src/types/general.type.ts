import { Dialect } from "sequelize";
export interface AppConfig {
  port: number;
  prefix: string;
  origin: string;
}

export interface TokenConfig {
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  rememberRefreshTokenExpiresIn: number;
}

export interface OtpConfig {
  otpLength: number;
  otpConfig: {
    lowerCaseAlphabets: boolean;
    upperCaseAlphabets: boolean;
    specialChars: boolean;
  };
}

export interface RedisConfig {
  redisHost: string;
  redisPort: number;
}

export interface DatabaseConfig {
  dbHost: string;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  dbDriver: Dialect;
}

export interface GameConfig {
  rwgUrl?: string;
  rwgKey?: string;
  twAuthUrl: string;
  twUrl: string;
  twClientId: string;
  twClientSecret: string;
}

export interface SmtpConfig {
  smtpPort: number;
  smtpEmail: string;
  smtpPassword: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  cloudApiKey: string;
  cloudApiSecret: string;
  cloudFolderName: string;
}

export interface GoogleConfig {
  googleClientId: string;
  googleClientSecret: string;
  googleOauthCallbackUrl: string;
}

export interface EmailProviderConfig {
  email: string;
  google: string;
  linkedin: string;
  facebook: string;
}
