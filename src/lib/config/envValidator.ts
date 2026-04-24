import { ValidationError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { EnvConfig, ValidatedEnv } from "@/types/config";

const ENV_CONFIG: EnvConfig = {
  JWT_SECRET: {
    required: true,
    validator: (v: string) =>
      v.length >= 32 || "JWT_SECRET must be at least 32 characters",
  },
  JWT_EXPIRES_IN: {
    required: true,
    validator: (v: string) =>
      /^\d+[dhm]$/.test(v) ||
      "JWT_EXPIRES_IN must be in format like '1h', '7d'",
  },
  REFRESH_TOKEN_SECRET: {
    required: true,
    validator: (v: string) =>
      v.length >= 32 || "REFRESH_TOKEN_SECRET must be at least 32 characters",
  },
  REFRESH_TOKEN_EXPIRY: {
    required: true,
    validator: (v: string) =>
      /^\d+[dhm]$/.test(v) ||
      "REFRESH_TOKEN_EXPIRY must be in format like '7d', '24h'",
  },
  REFRESH_TOKEN_LENGTH: {
    required: true,
    validator: (v: string) => {
      const num = parseInt(v, 10);
      return (
        (num >= 32 && num <= 128) ||
        "REFRESH_TOKEN_LENGTH must be between 32 and 128"
      );
    },
    transformer: (v: string) => parseInt(v, 10),
  },
  DATABASE_URL: { required: true },
  SALT_ROUNDS: {
    required: true,
    validator: (v: string) => {
      const num = parseInt(v, 10);
      return (
        (num >= 10 && num <= 14) || "SALT_ROUNDS must be between 10 and 14"
      );
    },
    transformer: (v: string) => parseInt(v, 10),
  },
};

function validateSingleEnv(key: string, config: EnvConfig[string]): unknown {
  const value = process.env[key];

  if (config.required && (!value || typeof value !== "string")) {
    throw new ValidationError(`${key} environment variable is required`);
  }

  if (!value) return undefined;

  if (config.validator) {
    const result = config.validator(value);
    if (result !== true) {
      throw new ValidationError(
        typeof result === "string" ? result : `${key} validation failed`,
      );
    }
  }

  return config.transformer ? config.transformer(value) : value;
}

export function validateEnvironment(): ValidatedEnv {
  const validated = {} as ValidatedEnv;

  for (const [key, config] of Object.entries(ENV_CONFIG)) {
    (validated as Record<string, unknown>)[key] = validateSingleEnv(
      key,
      config,
    );
  }

  logger.info(`Environment validated`, {
    variablesCount: Object.keys(ENV_CONFIG).length,
    validatedKeys: Object.keys(validated),
  });

  return validated;
}

export const ENV = validateEnvironment();
