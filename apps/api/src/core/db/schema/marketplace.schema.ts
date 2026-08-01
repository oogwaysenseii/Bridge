import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  pgEnum,
  uniqueIndex,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { users } from "./identity.schema.js";

export const listingConditionEnum = pgEnum("listing_condition", [
  "new",
  "like_new",
  "good",
  "fair",
  "poor",
]);
export const listingStatusEnum = pgEnum("listing_status", ["draft", "active", "sold", "removed"]);

/** Shared with likes (social.schema.ts) — see ADR-004 for the pattern. */
export const favoritableTypeEnum = pgEnum("favoritable_type", ["listing"]);

export const listingCategories = pgTable(
  "listing_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    parentId: uuid("parent_id").references((): AnyPgColumn => listingCategories.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [index("listing_categories_parent_idx").on(table.parentId)],
);

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerId: uuid("seller_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => listingCategories.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    priceCents: integer("price_cents").notNull(),
    currency: text("currency").notNull().default("USD"),
    condition: listingConditionEnum("condition").notNull(),
    status: listingStatusEnum("status").notNull().default("draft"),
    location: text("location"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("listings_seller_idx").on(table.sellerId),
    index("listings_category_idx").on(table.categoryId),
    index("listings_status_idx").on(table.status),
  ],
);

/**
 * `mediaId` is intentionally a bare uuid, not a cross-file FK — same
 * rationale as `profiles.avatarMediaId` in identity.schema.ts (avoids a
 * circular import with media.schema.ts; integrity enforced by the Media
 * Service).
 */
export const listingImages = pgTable(
  "listing_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "cascade" }),
    mediaId: uuid("media_id").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("listing_images_listing_idx").on(table.listingId)],
);

export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    favoritableType: favoritableTypeEnum("favoritable_type").notNull(),
    // Deliberately no FK — polymorphic target, see ADR-004.
    favoritableId: uuid("favoritable_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("favorites_user_target_idx").on(
      table.userId,
      table.favoritableType,
      table.favoritableId,
    ),
    index("favorites_target_idx").on(table.favoritableType, table.favoritableId),
  ],
);
