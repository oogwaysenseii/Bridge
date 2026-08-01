import * as Sentry from "@sentry/node";
import { env } from "../config/env";
import { logger } from "./logger";

const PRODUCTION_TRACE_SAMPLE_RATE = 0.1;
const DEVELOPMENT_TRACE_SAMPLE_RATE = 1.0;

/**
 * Call once at process startup, before the Hono app starts handling
 * requests. No-ops cleanly if SENTRY_DSN isn't configured (e.g. local dev)
 * rather than throwing — error tracking is required in production, not a
 * hard requirement for every developer's machine.
 */
export function initSentry(): void {
  if (!env.SENTRY_DSN) {
    logger.warn("SENTRY_DSN not set — error tracking is disabled. Required before production deploy.");
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate:
      env.NODE_ENV === "production" ? PRODUCTION_TRACE_SAMPLE_RATE : DEVELOPMENT_TRACE_SAMPLE_RATE,
  });

  logger.info("Sentry initialized");
}

export { Sentry };
