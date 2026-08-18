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

  /**
   * Both required only when EMAIL_PROVIDER="resend" — enforced explicitly
   * in loadEnv() below, not here, since that's a cross-field condition
   * plain optional() fields can't express on their own. EMAIL_FROM is a
   * plain string, not z.email(): Resend accepts both a bare address and a
   * "Name <address>" format, and the address must be on a domain verified
   * in the Resend dashboard — that's an account-level constraint this
   * schema can't validate, only the vendor can.
   */
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment configuration:");
    console.error(z.flattenError(parsed.error).fieldErrors);
    throw new Error("Invalid environment configuration — see errors above.");
  }

  const data = parsed.data;
  if (data.EMAIL_PROVIDER === "resend" && (!data.RESEND_API_KEY || !data.EMAIL_FROM)) {
    throw new Error(
      'EMAIL_PROVIDER="resend" requires both RESEND_API_KEY and EMAIL_FROM to be set.',
    );
  }

  return data;
}

export const env: Env = loadEnv();
