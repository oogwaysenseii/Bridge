import "dotenv/config";
import { z } from "zod";

const DEFAULT_PORT = 3000;
const BETTER_AUTH_SECRET_MIN_LENGTH = 32;

/**
 * Every environment variable the API depends on is declared here, once.
 * If a required variable is missing or malformed, the process fails at
 * startup with a clear message — not with a runtime `undefined.toString()`
 * three services deep. This is the single source of truth: no module reads
 * `process.env` directly anywhere else in the codebase.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(DEFAULT_PORT),

  DATABASE_URL: z.url({ message: "DATABASE_URL must be a valid postgres connection string" }),
  REDIS_URL: z.url({ message: "REDIS_URL must be a valid redis connection string" }),

  BETTER_AUTH_SECRET: z
    .string()
    .min(
      BETTER_AUTH_SECRET_MIN_LENGTH,
      `BETTER_AUTH_SECRET must be at least ${BETTER_AUTH_SECRET_MIN_LENGTH} characters — used to sign sessions`,
    ),
  BETTER_AUTH_URL: z.url(),

  EMAIL_PROVIDER: z.enum(["console", "resend", "postmark", "ses"]).default("console"),

  SENTRY_DSN: z.url().optional().or(z.literal("")),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),

  WEB_ORIGIN: z.url(),

  /** Auto-set to "1" by Vercel's own runtime — not something we configure. Optional since it's absent everywhere else (local dev, other hosts). */
  VERCEL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment configuration:");
    console.error(z.flattenError(parsed.error).fieldErrors);
    throw new Error("Invalid environment configuration — see errors above.");
  }
  return parsed.data;
}

export const env: Env = loadEnv();
