import {
  pgTable,
  uuid,
  text,
  timestamp,
  pgEnum,
  uniqueIndex,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { users } from "./identity.schema.js";

export const postVisibilityEnum = pgEnum("post_visibility", ["public", "connections", "private"]);

/**
 * Shared across likes, favorites (marketplace.schema.ts), and — post-MVP —
 * reviews. Extending this list is how a new likeable entity type opts in,
 * with no new table required. See ADR-004 for the integrity tradeoff this
 * accepts, and database.md for the mandatory soft-delete-only rule that
 * mitigates it.
 */
export const likeableTypeEnum = pgEnum("likeable_type", ["post", "comment", "listing"]);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    mediaIds: uuid("media_ids").array(),
    visibility: postVisibilityEnum("visibility").notNull().default("public"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("posts_author_idx").on(table.authorId),
    index("posts_created_at_idx").on(table.createdAt),
  ],
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Self-referencing FK for threaded replies — the `(): AnyPgColumn =>`
    // return-type annotation is Drizzle's documented pattern for a table
    // referencing its own not-yet-fully-defined column.
    parentCommentId: uuid("parent_comment_id").references((): AnyPgColumn => comments.id, {
      onDelete: "cascade",
    }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("comments_post_idx").on(table.postId),
    index("comments_parent_idx").on(table.parentCommentId),
  ],
);

export const likes = pgTable(
  "likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    likeableType: likeableTypeEnum("likeable_type").notNull(),
    // Deliberately no FK — polymorphic target, see ADR-004.
    likeableId: uuid("likeable_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("likes_user_target_idx").on(table.userId, table.likeableType, table.likeableId),
    index("likes_target_idx").on(table.likeableType, table.likeableId),
  ],
);
