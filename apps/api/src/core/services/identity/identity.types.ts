import type { ProfileSummary } from "@bridge/shared";

export interface IdentityUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  status: "active" | "suspended" | "deactivated";
  createdAt: Date;
}

export interface IdentityRepository {
  findUserById(userId: string): Promise<IdentityUser | null>;
  findProfileSummaryByUserId(userId: string): Promise<ProfileSummary | null>;
}

/**
 * Public interface documented in docs/core-services.md §1. Every module
 * that needs "who is this user" without joining into `users`/`profiles`
 * itself depends on this interface, not on the DB schema directly.
 */
export interface IdentityService {
  getUserById(userId: string): Promise<IdentityUser | null>;
  getProfileSummary(userId: string): Promise<ProfileSummary | null>;
  /** Must be called by any future write path that changes a profile (e.g. Phase 2's profile-update route). */
  invalidateProfileSummary(userId: string): Promise<void>;
}
