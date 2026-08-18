import { pgTable, uuid, text, timestamp, boolean, pgEnum, uniqueIndex, index } from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", ["active", "suspended", "deactivated"]);
export const profileVisibilityEnum = pgEnum("profile_visibility", ["public", "connections", "private"]);

/**
 * Better Auth's Drizzle adapter owns this table's core shape (id, email,
 * emailVerified, name, image, createdAt, updatedAt) — see core/auth/auth.ts.
 * Bridge-specific columns (phone, status, lastLoginAt) are registered with
 * Better Auth via its `user.additionalFields` config so they're written
 * through the same adapter rather than a second, disconnected write path.
 *
 * RISK FLAGGED FOR PHASE REVIEW: the exact additionalFields wiring depends
 * on the installed better-auth version's current API surface, which could
 * not be verified against live docs in this network-disabled sandbox (see
 * Phase 1 report). Verify this table against a real `pnpm install` +
 * Better Auth's own schema generation before treating it as final.
 */
export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  name: text("name"),
  image: text("image"),
  phone: text("phone"),
  status: userStatusEnum("status").notNull().default("active"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Better Auth-owned session table — see core/auth/auth.ts. */
export const sessions = pgTable(
  "session",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

/**
 * Better Auth-owned account table (credential provider + future OAuth).
 * Field named `password` (not `passwordHash`, despite storing a hash) to
 * match Better Auth's conventional Drizzle-adapter field name for this
 * column — the `schema` option in auth.ts maps table objects, not
 * individual field names, so this column's JS property name must match
 * what Better Auth's adapter itself reads/writes. Flagged alongside the
 * other unverified auth wiring in auth.ts's file-level comment.
 */
export const accounts = pgTable(
  "account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    password: text("password"),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    uniqueIndex("account_provider_account_idx").on(table.providerId, table.accountId),
  ],
);

/**
 * Better Auth-owned verification token table (email verify, password reset).
 * `updatedAt` is required by Better Auth's verification model (verified
 * against the installed v1.6.25 — @better-auth/core/dist/db/get-tables.mjs
 * declares it `required: true` with an onUpdate hook), so it must exist here
 * even though nothing else in Bridge reads it.
 */
export const verifications = pgTable(
  "verification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

/**
 * The rich, Bridge-owned identity record — separate from `users` (the auth
 * record) per architecture.md §4. `avatarMediaId`/`coverMediaId` are
 * intentionally plain uuid columns without a cross-file foreign key: a real
 * FK to `media` would require importing media.schema.ts here while
 * media.schema.ts imports `users` from this file — a circular module
 * dependency. Rather than rely on unverified circular-import behavior,
 * integrity here is enforced at the Media Service layer, the same
 * documented tradeoff already accepted for polymorphic relations (ADR-004).
 */
export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    username: text("username").notNull().unique(),
    bio: text("bio"),
    avatarMediaId: uuid("avatar_media_id"),
    coverMediaId: uuid("cover_media_id"),
    location: text("location"),
    websiteUrl: text("website_url"),
    visibility: profileVisibilityEnum("visibility").notNull().default("public"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("profiles_username_idx").on(table.username)],
);

export const follows = pgTable(
  "follows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("follows_follower_following_idx").on(table.followerId, table.followingId),
    index("follows_follower_idx").on(table.followerId),
    index("follows_following_idx").on(table.followingId),
  ],
);
