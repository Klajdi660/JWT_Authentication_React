export interface AppConfig {
  port: number;
  prefix: string;
  origin: string;
}

export interface TokenConfig {
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
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
  gameUrl: string;
  gameKey: string;
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
}

export interface GoogleConfig {
  googleClientId: string;
  googleClientSecret: string;
  googleOauthRedirect: string;
}
