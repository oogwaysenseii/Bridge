import { z } from "zod";

/**
 * Password policy is defined once, here, and reused by both the signup form
 * (client) and the auth route validation (server) — see ADR-007. Values are
 * named constants rather than inline magic numbers so the policy can be
 * audited and changed in a single place.
 */
export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_MAX_LENGTH = 128;
export const DISPLAY_NAME_MIN_LENGTH = 2;
export const DISPLAY_NAME_MAX_LENGTH = 50;

/**
 * Migrated to Zod 4's top-level `z.email()` (the `.string().email()`
 * chained form is deprecated as of Zod 4 — see docs/dependency-audit.md).
 * Built with `.pipe()` rather than `z.email().trim().toLowerCase()` to
 * preserve the exact original validation order: trim + lowercase run
 * BEFORE the email format check, same as the pre-migration version. Doing
 * it the other way — checking the format first, then normalizing — would
 * reject a validly-formatted email that merely had surrounding whitespace
 * or mixed case, which is a real behavior change, not just a syntax
 * update.
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: "Enter a valid email address" }));

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters`);

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z
    .string()
    .trim()
    .min(DISPLAY_NAME_MIN_LENGTH, `Display name must be at least ${DISPLAY_NAME_MIN_LENGTH} characters`)
    .max(DISPLAY_NAME_MAX_LENGTH, `Display name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters`),
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
