import type { ProfileSummary } from "@bridge/shared";
import type { Cache } from "../../cache/cache.interface.js";
import type { IdentityRepository, IdentityService as IIdentityService, IdentityUser } from "./identity.types.js";

const PROFILE_SUMMARY_CACHE_TTL_SECONDS = 300;
const PROFILE_SUMMARY_CACHE_KEY_PREFIX = "identity:profile-summary:";

/**
 * See docs/core-services.md §1. `getProfileSummary` is cached because it's
 * called by nearly every other module (feed authorship cards, listing
 * seller info, notification actor info, ...) — avoiding a DB round trip
 * here matters more than almost anywhere else in the system.
 *
 * This class depends only on the `IdentityRepository`/`Cache` abstractions
 * above — no concrete infrastructure (Drizzle, Redis) is imported here.
 * That's deliberate: wiring the real `DrizzleIdentityRepository` and
 * `defaultCache` into a ready-to-use instance is a composition-root
 * concern, not this class's own concern — see
 * core/api/router.ts, the sole production consumer, for where that
 * wiring actually happens. Importing *this* file — including from a unit
 * test that always injects fakes — never transitively touches env.ts,
 * db/client.ts, or redis.client.ts, none of which a pure unit test needs.
 */
export class IdentityServiceImpl implements IIdentityService {
  public constructor(
    private readonly repository: IdentityRepository,
    private readonly cache: Cache,
  ) {}

  public async getUserById(userId: string): Promise<IdentityUser | null> {
    const user = await this.repository.findUserById(userId);
    return user;
  }

  public async getProfileSummary(userId: string): Promise<ProfileSummary | null> {
    const cacheKey = this.profileSummaryCacheKey(userId);
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as ProfileSummary;
    }

    const summary = await this.repository.findProfileSummaryByUserId(userId);
    if (summary) {
      await this.cache.set(cacheKey, JSON.stringify(summary), PROFILE_SUMMARY_CACHE_TTL_SECONDS);
    }
    return summary;
  }

  public async invalidateProfileSummary(userId: string): Promise<void> {
    await this.cache.del(this.profileSummaryCacheKey(userId));
  }

  private profileSummaryCacheKey(userId: string): string {
    return `${PROFILE_SUMMARY_CACHE_KEY_PREFIX}${userId}`;
  }
}
