import { eq } from "drizzle-orm";
import type { ProfileSummary } from "@bridge/shared";
import { db, type Database } from "../../db/client";
import { users, profiles } from "../../db/schema";
import type { IdentityRepository, IdentityUser } from "./identity.types";

const SINGLE_ROW = 1;

export class DrizzleIdentityRepository implements IdentityRepository {
  public constructor(private readonly database: Database = db) {}

  public async findUserById(userId: string): Promise<IdentityUser | null> {
    const rows = await this.database
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(SINGLE_ROW);
    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      emailVerified: row.emailVerified,
      name: row.name,
      status: row.status,
      createdAt: row.createdAt,
    };
  }

  public async findProfileSummaryByUserId(userId: string): Promise<ProfileSummary | null> {
    const rows = await this.database
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(SINGLE_ROW);
    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      displayName: row.displayName,
      username: row.username,
      avatarMediaId: row.avatarMediaId,
    };
  }
}
