import { Queue, Worker, type Job, type Processor } from "bullmq";
import { redis } from "../cache/redis.client.js";
import { logger } from "../observability/logger.js";

/**
 * Central queue names live here as a const enum-like object — not scattered
 * string literals — so a typo in a queue name is a compile error, not a
 * silently-dropped job. Per ADR-006, this infrastructure is scaffolded in
 * Phase 1; the first real consumer (media variant generation) is added by
 * the Media Service in Phase 2. No fake/placeholder queue is registered
 * here — only the reusable factory.
 */
export const QUEUE_NAMES = {
  // Reserved for Phase 2 (Media Service): image variant generation.
  MEDIA_VARIANTS: "media-variants",
  // Reserved for Phase 3 (Notification Service): async notification fan-out.
  NOTIFICATION_FANOUT: "notification-fanout",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

/**
 * Creates a typed BullMQ Queue bound to the shared Redis connection.
 * Callers get compile-time typing on the job payload shape `T`.
 */
export function createQueue<T extends object>(name: QueueName): Queue<T> {
  return new Queue<T>(name, { connection: redis });
}

/**
 * Creates a typed BullMQ Worker bound to the shared Redis connection.
 * The processor is required at construction time — this factory
 * deliberately does not support a "worker with no processor yet" state,
 * since that would be exactly the kind of placeholder implementation the
 * project rules prohibit. A queue with no consumer yet (Phase 1) simply
 * has no worker created for it yet either.
 */
export function createWorker<T extends object>(name: QueueName, processor: Processor<T>): Worker<T> {
  const worker = new Worker<T>(name, processor, { connection: redis });

  worker.on("failed", (job: Job<T> | undefined, err: Error) => {
    logger.error({ err, jobId: job?.id, queue: name }, "Job failed");
  });

  return worker;
}
