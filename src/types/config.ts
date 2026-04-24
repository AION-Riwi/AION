export type ValidatedEnv = {
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  REFRESH_TOKEN_SECRET: string;
  REFRESH_TOKEN_EXPIRY: string;
  REFRESH_TOKEN_LENGTH: number;
  DATABASE_URL: string;
  SALT_ROUNDS: number;
};

export interface EnvConfig {
  [key: string]: {
    required?: boolean;
    validator?: (value: string) => boolean | string;
    transformer?: (value: string) => unknown;
  };
}
