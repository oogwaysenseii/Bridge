import { default as Redis } from "ioredis";
import { env } from "../config/env";
import { logger } from "../observability/logger";

/**
 * Single shared Redis connection. Used directly for caching (e.g. the
 * Identity Service's profile-summary cache — see docs/core-services.md §1)
 * and as the connection backend for BullMQ (see ../queue/queue.ts).
 *
 * `maxRetriesPerRequest: null` is required by BullMQ's connection contract
 * (it manages its own retry/backoff), so we set it here at the shared
 * client level rather than special-casing it per consumer.
 */
export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on("error", (err: Error) => {
  logger.error({ err }, "Redis connection error");
});

redis.on("connect", () => {
  logger.info("Redis connected");
});
