import { z } from 'zod';

/**
 * Configuration schema for the Ekilex MCP server
 */
export const ConfigSchema = z.object({
  /** Ekilex API key (required) */
  apiKey: z.string().min(1, 'EKILEX_API_KEY is required'),

  /** Ekilex API base URL */
  baseUrl: z.string().url().default('https://ekilex.eki.ee'),

  /** Request timeout in milliseconds */
  timeout: z.number().positive().default(30000),

  /** Log level */
  logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Configuration error thrown when config is invalid
 */
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

/**
 * Load configuration from environment variables
 */
export function loadConfig(): Config {
  const rawConfig = {
    apiKey: process.env['EKILEX_API_KEY'],
    baseUrl: process.env['EKILEX_BASE_URL'] ?? 'https://ekilex.eki.ee',
    timeout: process.env['EKILEX_TIMEOUT']
      ? parseInt(process.env['EKILEX_TIMEOUT'], 10)
      : 30000,
    logLevel: process.env['LOG_LEVEL'] ?? 'info',
  };

  const result = ConfigSchema.safeParse(rawConfig);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    throw new ConfigurationError(`Invalid configuration: ${errors}`);
  }

  return result.data;
}

/**
 * Validate that required configuration is present
 * Call this at startup to fail fast on missing config
 */
export function validateConfig(config: Config): void {
  if (!config.apiKey) {
    throw new ConfigurationError(
      'EKILEX_API_KEY environment variable is required. ' +
        'Get your API key from https://ekilex.eki.ee after creating an account.'
    );
  }
}
