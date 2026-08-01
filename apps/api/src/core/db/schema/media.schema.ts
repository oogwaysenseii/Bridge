import { pgTable, uuid, text, timestamp, integer, jsonb, pgEnum, index } from "drizzle-orm/pg-core";
import { users } from "./identity.schema";

export const mediaTypeEnum = pgEnum("media_type", ["image", "video", "document"]);

export interface MediaVariants {
  thumb?: string;
  small?: string;
  medium?: string;
  large?: string;
}

/**
 * Every module references media by `media_id` rather than implementing its
 * own image logic — see docs/architecture.md §4 and the Media Service
 * (docs/core-services.md §2). `variants` is populated asynchronously by the
 * BullMQ media-variants worker (Phase 2); it is null until that job runs.
 */
export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    type: mediaTypeEnum("type").notNull(),
    width: integer("width"),
    height: integer("height"),
    sizeBytes: integer("size_bytes").notNull(),
    variants: jsonb("variants").$type<MediaVariants>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("media_owner_idx").on(table.ownerUserId)],
);
