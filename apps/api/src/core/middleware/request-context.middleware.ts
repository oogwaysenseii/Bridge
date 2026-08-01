import type { MiddlewareHandler } from "hono";
import { randomUUID } from "node:crypto";
import { logger } from "../observability/logger";
import type { AppEnv } from "../types/hono-env";

const REQUEST_ID_HEADER = "x-request-id";

/**
 * Attaches a request ID (reused from an upstream proxy header if present)
 * and a child logger pre-bound with that ID to every request. Every log
 * line for a given request can then be correlated without threading an ID
 * through every function call manually.
 */
export const requestContext: MiddlewareHandler<AppEnv> = async (c, next) => {
  const requestId = c.req.header(REQUEST_ID_HEADER) ?? randomUUID();
  c.set("requestId", requestId);
  c.set("logger", logger.child({ requestId }));
  c.header(REQUEST_ID_HEADER, requestId);
  await next();
};
