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
  dbUrl?: string;
  host: string;
  user: string;
  password: string;
  database: string;
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
  service: string;
  host: string;
  port: number;
  secure: boolean;
  email: string;
  password: string;
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
