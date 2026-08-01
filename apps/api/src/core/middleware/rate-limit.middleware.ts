import type { MiddlewareHandler } from "hono";
import { RateLimitedError } from "../errors/app-error";

const MILLISECONDS_PER_SECOND = 1000;

interface RateLimitOptions {
  /** Max requests allowed within the window, per key. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
  /** How to derive the rate-limit key from the request — defaults to client IP. */
  keyFn?: (c: Parameters<MiddlewareHandler>[0]) => string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * In-memory limiter — correct for a single-instance MVP deployment (see
 * docs/api.md). This is a *documented* limitation, not an oversight: once
 * the API runs on more than one instance, this must be swapped for a
 * Redis-backed limiter (the connection is already available via
 * core/cache/redis.client.ts) using the same `RateLimitOptions` shape, so
 * the swap changes this one file, not every route that uses it.
 */
export function rateLimit(options: RateLimitOptions): MiddlewareHandler {
  const buckets = new Map<string, Bucket>();

  return async (c, next) => {
    const key = options.keyFn?.(c) ?? c.req.header("x-forwarded-for") ?? "unknown";
    const now = Date.now();
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowSeconds * MILLISECONDS_PER_SECOND });
      await next();
      return;
    }

    if (existing.count >= options.limit) {
      const retryAfterSeconds = Math.ceil((existing.resetAt - now) / MILLISECONDS_PER_SECOND);
      throw new RateLimitedError(retryAfterSeconds);
    }

    existing.count += 1;
    await next();
  };
}
