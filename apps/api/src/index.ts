import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { auth } from "./core/auth/auth.js";
import { resolveSession } from "./core/auth/auth.middleware.js";
import { requestContext } from "./core/middleware/request-context.middleware.js";
import { rateLimit } from "./core/middleware/rate-limit.middleware.js";
import { errorHandler } from "./core/errors/error-handler.middleware.js";
import { coreRouter } from "./core/api/router.js";
import { env } from "./core/config/env.js";
import { logger } from "./core/observability/logger.js";
import { initSentry } from "./core/observability/sentry.js";
import type { AppEnv } from "./core/types/hono-env.js";

const AUTH_RATE_LIMIT = { limit: 10, windowSeconds: 60 };

initSentry();

const app = new Hono<AppEnv>()
  .use(requestContext)
  .use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true, // Better Auth relies on cookies
    }),
  )
  .use(secureHeaders())
  .use(resolveSession)
  .onError(errorHandler)

  // Better Auth's own handler owns everything under /api/auth/* (sign-up,
  // sign-in, session, email verification, password reset). Rate-limited
  // here rather than inside Better Auth's config, per api.md's convention
  // that rate limiting lives at the Hono middleware layer, applied to the
  // platform's clearest abuse surfaces.
  .on(["POST", "GET"], "/api/auth/*", rateLimit(AUTH_RATE_LIMIT), (c) => auth.handler(c.req.raw))

  .route("/api", coreRouter);

/** Exported for the Hono RPC client (apps/web/src/core/api/rpc-client.ts) — see ADR-007. */
export type AppType = typeof app;

/**
 * Local development / traditional Node deployment only. Per Vercel's own
 * Hono deployment docs (vercel.com/docs/frameworks/backend/hono,
 * hono.dev/docs/getting-started/vercel), a Vercel Function invokes the
 * default-exported Hono app's `.fetch` directly per-request — nothing on
 * that platform ever routes traffic to a bound port, so starting one
 * there serves no purpose. Gated on Vercel's own `VERCEL` system env var.
 */
if (!env.VERCEL) {
  serve({ fetch: app.fetch, port: env.PORT }, (info) => {
    logger.info({ port: info.port }, `Bridge API listening`);
  });
}

/**
 * Required by Vercel's zero-config Hono detection: the app instance must
 * be the module's default export for Vercel to recognize and correctly
 * bundle it as a Vercel Function. Without this, Vercel falls back to
 * treating the file as an unrecognized Node.js entry point — a naive,
 * unbundled per-file transpile that leaves relative imports extensionless
 * and unresolvable by Node's native ESM loader at runtime, which is what
 * produced the ERR_MODULE_NOT_FOUND crash this fixes.
 */
export default app;
