import { fileURLToPath } from 'node:url';
import { z } from 'zod';

/**
 * Runtime configuration. Everything is validated once at startup so the
 * process fails fast instead of misbehaving in production.
 */
export const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  PUBLIC_BASE_URL: z.string().url().default('http://localhost:5173'),
  /**
   * Where saved projects and runs live. Defaults next to the server package so
   * `npm run dev`, `npm start`, and the test runner all resolve the same file.
   */
  DATA_FILE: z
    .string()
    .min(1)
    .default(fileURLToPath(new URL('../.data/workspace.json', import.meta.url))),
  /**
   * `embedded` keeps a clone, CI, and offline machines deterministic. `live`
   * opts into the public feed, with a timeout, TTL cache, and fallback.
   */
  SOURCE_MODE: z.enum(['live', 'embedded']).default('embedded')
});

export type AppConfig = z.infer<typeof configSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return configSchema.parse(env);
}
