import { z } from "zod";

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
const USERNAME_PATTERN = /^[a-z0-9_]+$/;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters`)
  .max(USERNAME_MAX_LENGTH, `Username must be at most ${USERNAME_MAX_LENGTH} characters`)
  .regex(USERNAME_PATTERN, "Username can only contain lowercase letters, numbers, and underscores");

/**
 * Mirrors the `profiles.visibility` enum in apps/api/src/core/db/schema —
 * kept here as the single source of truth consumed by both the DB schema
 * and any client-side visibility picker, so the two can never drift silently.
 */
export const profileVisibilitySchema = z.enum(["public", "connections", "private"]);
export type ProfileVisibility = z.infer<typeof profileVisibilitySchema>;

/** Migrated to Zod 4's top-level `z.uuid()` — the `.string().uuid()` chained form is deprecated as of Zod 4 (see docs/dependency-audit.md). No preceding transform here, so this is a direct swap. */
export const profileSummarySchema = z.object({
  id: z.uuid(),
  displayName: z.string(),
  username: usernameSchema,
  avatarMediaId: z.uuid().nullable(),
});

/** Returned by the Identity Service's getProfileSummary() — see docs/core-services.md §1. */
export type ProfileSummary = z.infer<typeof profileSummarySchema>;
