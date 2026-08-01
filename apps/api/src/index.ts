import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { auth } from "./core/auth/auth";
import { resolveSession } from "./core/auth/auth.middleware";
import { requestContext } from "./core/middleware/request-context.middleware";
import { rateLimit } from "./core/middleware/rate-limit.middleware";
import { errorHandler } from "./core/errors/error-handler.middleware";
import { coreRouter } from "./core/api/router";
import { env } from "./core/config/env";
import { logger } from "./core/observability/logger";
import { initSentry } from "./core/observability/sentry";
import type { AppEnv } from "./core/types/hono-env";

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

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info({ port: info.port }, `Bridge API listening`);
});
