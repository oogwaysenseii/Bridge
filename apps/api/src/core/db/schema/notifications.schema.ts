import { pgTable, uuid, timestamp, pgEnum, index } from "drizzle-orm/pg-core";
import { users } from "./identity.schema";

export const notificationTypeEnum = pgEnum("notification_type", [
  "like",
  "comment",
  "message",
  "follow",
  "listing_favorited",
]);
export const notificationSubjectTypeEnum = pgEnum("notification_subject_type", [
  "post",
  "comment",
  "message",
  "user",
  "listing",
]);
/** Added in the v1.1 architecture review — see docs/architecture.md §8. In-app only is implemented at MVP; push/email are documented targets for the Notification Service's delivery adapters. */
export const deliveryChannelEnum = pgEnum("delivery_channel", ["in_app", "push", "email"]);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recipientId: uuid("recipient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Nullable: system-generated notifications (future) have no human actor.
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
    type: notificationTypeEnum("type").notNull(),
    subjectType: notificationSubjectTypeEnum("subject_type").notNull(),
    // Deliberately no FK — polymorphic target, see ADR-004.
    subjectId: uuid("subject_id").notNull(),
    deliveryChannel: deliveryChannelEnum("delivery_channel").notNull().default("in_app"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("notifications_recipient_idx").on(table.recipientId),
    index("notifications_recipient_unread_idx").on(table.recipientId, table.readAt),
  ],
);
