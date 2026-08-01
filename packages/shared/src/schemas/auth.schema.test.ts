import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  signUpSchema,
  signInSchema,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
} from "./auth.schema";

describe("emailSchema", () => {
  it("accepts a valid email", () => {
    const result = emailSchema.safeParse("ada@bridge.dev");
    expect(result.success).toBe(true);
  });

  it("trims and lowercases before validating — normalization runs before the format check, not after", () => {
    // If format were checked before normalization, the raw value below
    // (mixed case, surrounding whitespace) would very plausibly fail an
    // email-format check first; this only passes if trim+lowercase runs
    // first, exactly as auth.schema.ts's own comment documents.
    const result = emailSchema.safeParse("  Ada@Bridge.DEV  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("ada@bridge.dev");
    }
  });

  it("rejects a malformed email", () => {
    const result = emailSchema.safeParse("not-an-email");
    expect(result.success).toBe(false);
  });

  it("rejects an empty string", () => {
    const result = emailSchema.safeParse("");
    expect(result.success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepts a password at exactly the minimum length", () => {
    const result = passwordSchema.safeParse("a".repeat(PASSWORD_MIN_LENGTH));
    expect(result.success).toBe(true);
  });

  it("accepts a password at exactly the maximum length", () => {
    const result = passwordSchema.safeParse("a".repeat(PASSWORD_MAX_LENGTH));
    expect(result.success).toBe(true);
  });

  it("rejects a password one character below the minimum, with the documented message", () => {
    const result = passwordSchema.safeParse("a".repeat(PASSWORD_MIN_LENGTH - 1));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
      );
    }
  });

  it("rejects a password one character above the maximum, with the documented message", () => {
    const result = passwordSchema.safeParse("a".repeat(PASSWORD_MAX_LENGTH + 1));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
      );
    }
  });
});

describe("signUpSchema", () => {
  const validInput = {
    email: "ada@bridge.dev",
    password: "a".repeat(PASSWORD_MIN_LENGTH),
    displayName: "Ada Lovelace",
  };

  it("accepts a fully valid signup payload", () => {
    const result = signUpSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("trims the display name", () => {
    const result = signUpSchema.safeParse({ ...validInput, displayName: "  Ada Lovelace  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayName).toBe("Ada Lovelace");
    }
  });

  it("rejects a display name below the minimum length", () => {
    const result = signUpSchema.safeParse({ ...validInput, displayName: "a".repeat(DISPLAY_NAME_MIN_LENGTH - 1) });
    expect(result.success).toBe(false);
  });

  it("accepts a display name at exactly the minimum length", () => {
    const result = signUpSchema.safeParse({ ...validInput, displayName: "a".repeat(DISPLAY_NAME_MIN_LENGTH) });
    expect(result.success).toBe(true);
  });

  it("rejects a display name above the maximum length", () => {
    const result = signUpSchema.safeParse({ ...validInput, displayName: "a".repeat(DISPLAY_NAME_MAX_LENGTH + 1) });
    expect(result.success).toBe(false);
  });

  it("rejects a payload missing required fields", () => {
    const result = signUpSchema.safeParse({ email: "ada@bridge.dev" });
    expect(result.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("accepts a valid sign-in payload", () => {
    const result = signInSchema.safeParse({ email: "ada@bridge.dev", password: "whatever-was-set-at-signup" });
    expect(result.success).toBe(true);
  });

  it("does not enforce the full signup password policy — only requires non-empty", () => {
    // Deliberately different from signUpSchema: an existing account's
    // password may have been created under different rules, and sign-in
    // shouldn't reveal policy details for a login attempt. A password
    // shorter than PASSWORD_MIN_LENGTH must still be accepted here.
    const shortPassword = "a".repeat(PASSWORD_MIN_LENGTH - 1);
    const result = signInSchema.safeParse({ email: "ada@bridge.dev", password: shortPassword });
    expect(result.success).toBe(true);
  });

  it("rejects an empty password with the documented message", () => {
    const result = signInSchema.safeParse({ email: "ada@bridge.dev", password: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Password is required");
    }
  });
});
