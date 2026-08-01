import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ProfileSummary } from "@bridge/shared";
import type { Cache } from "../../cache/cache.interface";
import type { IdentityRepository, IdentityUser } from "./identity.types";
import { IdentityServiceImpl } from "./identity.service";

const FIXED_DATE = new Date("2026-01-01T00:00:00.000Z");

function createFakeRepository(overrides: Partial<IdentityRepository> = {}): IdentityRepository {
  return {
    findUserById: vi.fn().mockResolvedValue(null),
    findProfileSummaryByUserId: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

/** In-memory fake — exercises the real caching *behavior* without a real Redis connection. */
function createFakeCache(): Cache {
  const store = new Map<string, string>();
  return {
    get: vi.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
    set: vi.fn((key: string, value: string) => {
      store.set(key, value);
      return Promise.resolve();
    }),
    del: vi.fn((key: string) => {
      store.delete(key);
      return Promise.resolve();
    }),
  };
}

const testUser: IdentityUser = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "ada@bridge.dev",
  emailVerified: true,
  name: "Ada Lovelace",
  status: "active",
  createdAt: FIXED_DATE,
};

const testProfileSummary: ProfileSummary = {
  id: "22222222-2222-2222-2222-222222222222",
  displayName: "Ada Lovelace",
  username: "ada",
  avatarMediaId: null,
};

describe("IdentityServiceImpl", () => {
  describe("getUserById", () => {
    it("returns the user from the repository", async () => {
      const repository = createFakeRepository({
        findUserById: vi.fn().mockResolvedValue(testUser),
      });
      const service = new IdentityServiceImpl(repository, createFakeCache());

      const result = await service.getUserById(testUser.id);

      expect(result).toEqual(testUser);
    });

    it("returns null when the user does not exist", async () => {
      const service = new IdentityServiceImpl(createFakeRepository(), createFakeCache());

      const result = await service.getUserById("does-not-exist");

      expect(result).toBeNull();
    });
  });

  describe("getProfileSummary", () => {
    let repository: IdentityRepository;
    let cache: Cache;

    beforeEach(() => {
      repository = createFakeRepository({
        findProfileSummaryByUserId: vi.fn().mockResolvedValue(testProfileSummary),
      });
      cache = createFakeCache();
    });

    it("fetches from the repository and populates the cache on a cache miss", async () => {
      const service = new IdentityServiceImpl(repository, cache);

      const result = await service.getProfileSummary(testUser.id);

      expect(result).toEqual(testProfileSummary);
      expect(repository.findProfileSummaryByUserId).toHaveBeenCalledWith(testUser.id);
      expect(cache.set).toHaveBeenCalledOnce();
    });

    it("serves from the cache on a cache hit, without hitting the repository again", async () => {
      const service = new IdentityServiceImpl(repository, cache);
      await service.getProfileSummary(testUser.id); // populates cache

      vi.mocked(repository.findProfileSummaryByUserId).mockClear();
      const result = await service.getProfileSummary(testUser.id);

      expect(result).toEqual(testProfileSummary);
      expect(repository.findProfileSummaryByUserId).not.toHaveBeenCalled();
    });

    it("does not cache a null result", async () => {
      repository = createFakeRepository({ findProfileSummaryByUserId: vi.fn().mockResolvedValue(null) });
      const service = new IdentityServiceImpl(repository, cache);

      const result = await service.getProfileSummary("no-profile-user");

      expect(result).toBeNull();
      expect(cache.set).not.toHaveBeenCalled();
    });
  });

  describe("invalidateProfileSummary", () => {
    it("removes the cached entry so the next read hits the repository again", async () => {
      const repository = createFakeRepository({
        findProfileSummaryByUserId: vi.fn().mockResolvedValue(testProfileSummary),
      });
      const cache = createFakeCache();
      const service = new IdentityServiceImpl(repository, cache);
      await service.getProfileSummary(testUser.id); // populates cache

      await service.invalidateProfileSummary(testUser.id);
      vi.mocked(repository.findProfileSummaryByUserId).mockClear();
      await service.getProfileSummary(testUser.id);

      expect(repository.findProfileSummaryByUserId).toHaveBeenCalledOnce();
    });
  });
});
