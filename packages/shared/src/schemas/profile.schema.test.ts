import { describe, it, expect } from "vitest";
import {
  usernameSchema,
  profileVisibilitySchema,
  profileSummarySchema,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
} from "./profile.schema";

describe("usernameSchema", () => {
  it("accepts a valid username", () => {
    const result = usernameSchema.safeParse("ada_lovelace1");
    expect(result.success).toBe(true);
  });

  it("trims and lowercases", () => {
    const result = usernameSchema.safeParse("  Ada_Lovelace  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("ada_lovelace");
    }
  });

  it("accepts a username at exactly the minimum length", () => {
    const result = usernameSchema.safeParse("a".repeat(USERNAME_MIN_LENGTH));
    expect(result.success).toBe(true);
  });

  it("accepts a username at exactly the maximum length", () => {
    const result = usernameSchema.safeParse("a".repeat(USERNAME_MAX_LENGTH));
    expect(result.success).toBe(true);
  });

  it("rejects a username one character below the minimum, with the documented message", () => {
    const result = usernameSchema.safeParse("a".repeat(USERNAME_MIN_LENGTH - 1));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        `Username must be at least ${USERNAME_MIN_LENGTH} characters`,
      );
    }
  });

  it("rejects a username one character above the maximum, with the documented message", () => {
    const result = usernameSchema.safeParse("a".repeat(USERNAME_MAX_LENGTH + 1));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        `Username must be at most ${USERNAME_MAX_LENGTH} characters`,
      );
    }
  });

  it("accepts uppercase letters — normalized to lowercase before the pattern check, not rejected by it", () => {
    // The regex itself only allows [a-z0-9_], but .toLowerCase() runs
    // first, so pure-uppercase input becomes valid after normalization.
    // This is the real, documented order of operations, not an assumption.
    const result = usernameSchema.safeParse("ADAVELACE");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("adavelace");
    }
  });

  it("rejects characters outside [a-z0-9_] that survive lowercasing, with the documented message", () => {
    const result = usernameSchema.safeParse("ada lovelace");
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Username can only contain lowercase letters, numbers, and underscores",
      );
    }
  });

  it("rejects a hyphen, which is not in the allowed character set", () => {
    const result = usernameSchema.safeParse("ada-lovelace");
    expect(result.success).toBe(false);
  });
});

describe("profileVisibilitySchema", () => {
  it.each(["public", "connections", "private"] as const)("accepts %s", (value) => {
    const result = profileVisibilitySchema.safeParse(value);
    expect(result.success).toBe(true);
  });

  it("rejects a value outside the enum", () => {
    const result = profileVisibilitySchema.safeParse("hidden");
    expect(result.success).toBe(false);
  });
});

describe("profileSummarySchema", () => {
  // Zod 4's z.uuid() enforces RFC 9562/4122 compliance: the third group's
  // first hex digit must be a valid version (1-8), and the fourth group's
  // first hex digit must be a valid variant (8/9/a/b — the two most
  // significant bits must be `10`). "11111111-1111-1111-1111-111111111111"
  // is UUID-*shaped* but not RFC-compliant (variant digit `1` isn't in the
  // required range) — confirmed against Zod's own uuid() regex. These
  // fixtures use version 4 (`4`) and variant `8`, both valid.
  const validInput = {
    id: "11111111-1111-4111-8111-111111111111",
    displayName: "Ada Lovelace",
    username: "ada_lovelace",
    avatarMediaId: null,
  };

  it("accepts a fully valid profile summary", () => {
    const result = profileSummarySchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("accepts a null avatarMediaId", () => {
    const result = profileSummarySchema.safeParse({ ...validInput, avatarMediaId: null });
    expect(result.success).toBe(true);
  });

  it("accepts a valid UUID avatarMediaId", () => {
    const result = profileSummarySchema.safeParse({
      ...validInput,
      avatarMediaId: "22222222-2222-4222-8222-222222222222",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed id (not a valid UUID)", () => {
    const result = profileSummarySchema.safeParse({ ...validInput, id: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed avatarMediaId (not a valid UUID, and not null)", () => {
    const result = profileSummarySchema.safeParse({ ...validInput, avatarMediaId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects an embedded username that fails usernameSchema's own rules", () => {
    // Confirms usernameSchema's constraints are actually enforced through
    // the composition, not just when called standalone.
    const result = profileSummarySchema.safeParse({ ...validInput, username: "a" });
    expect(result.success).toBe(false);
  });
});
