import { pgTable, uuid, timestamp, jsonb, pgEnum, index } from "drizzle-orm/pg-core";
import { users } from "./identity.schema.js";

/**
 * Extend this list as new event-emitting actions are added — it's the
 * contract between producing modules and the Activity Service's
 * subscribers (Search, Notification, future Recommendation). See
 * docs/core-services.md §3 and §8 for the full event-flow pattern.
 */
export const activityEventTypeEnum = pgEnum("activity_event_type", [
  "user.followed",
  "post.created",
  "comment.created",
  "listing.created",
  "listing.favorited",
  "message.sent",
]);
export const activitySubjectTypeEnum = pgEnum("activity_subject_type", [
  "user",
  "post",
  "comment",
  "listing",
  "message",
]);

/**
 * Append-only — no `deletedAt`, no update path. This is a durable event
 * log, not a mutable domain record (see database.md). Partitioning by time
 * range is the documented scaling step once volume warrants it.
 */
export const activityLog = pgTable(
  "activity_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventType: activityEventTypeEnum("event_type").notNull(),
    subjectType: activitySubjectTypeEnum("subject_type").notNull(),
    subjectId: uuid("subject_id").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("activity_log_subject_idx").on(table.subjectType, table.subjectId),
    index("activity_log_event_created_idx").on(table.eventType, table.createdAt),
  ],
);
