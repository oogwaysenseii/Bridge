import { pgTable, uuid, text, timestamp, pgEnum, uniqueIndex, index } from "drizzle-orm/pg-core";
import { users } from "./identity.schema";

export const conversationTypeEnum = pgEnum("conversation_type", ["direct", "group", "marketplace"]);
/** Extend this enum, not the shape, when a new context (e.g. a future job application thread) needs to link back to a module without messaging depending on it. */
export const conversationContextTypeEnum = pgEnum("conversation_context_type", ["listing"]);
export const conversationMemberRoleEnum = pgEnum("conversation_member_role", ["member", "admin"]);
export const messageStatusEnum = pgEnum("message_status", ["sent", "delivered", "read"]);

/**
 * `contextType`/`contextId` is how a marketplace chat ties back to a
 * `listing` without the messaging module needing to know marketplace
 * internals beyond an opaque reference — see architecture.md §4.
 */
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: conversationTypeEnum("type").notNull(),
    contextType: conversationContextTypeEnum("context_type"),
    contextId: uuid("context_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("conversations_context_idx").on(table.contextType, table.contextId)],
);

export const conversationMembers = pgTable(
  "conversation_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: conversationMemberRoleEnum("role").notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
    lastReadAt: timestamp("last_read_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("conversation_members_unique_idx").on(table.conversationId, table.userId),
    index("conversation_members_conversation_idx").on(table.conversationId),
    index("conversation_members_user_idx").on(table.userId),
  ],
);

/**
 * `mediaId` is a bare uuid (no cross-file FK) — same rationale as
 * marketplace.schema.ts's listingImages.mediaId. `conversationId` +
 * `createdAt` composite index directly supports the hot "messages in this
 * conversation, newest first" query; partitioning this table by
 * conversation_id or time is the documented Phase 5+ scaling step (see
 * database.md), not implemented at Phase 1 volume.
 */
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    mediaId: uuid("media_id"),
    status: messageStatusEnum("status").notNull().default("sent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("messages_conversation_idx").on(table.conversationId),
    index("messages_conversation_created_idx").on(table.conversationId, table.createdAt),
  ],
);
