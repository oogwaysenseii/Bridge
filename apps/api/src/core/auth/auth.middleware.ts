import type { Context, MiddlewareHandler } from "hono";
import { auth, type AuthUser } from "./auth";
import { UnauthorizedError } from "../errors/app-error";
import type { AppEnv } from "../types/hono-env";

/**
 * Resolves the Better Auth session for every request and attaches it to
 * context, defaulting to null rather than leaving it unset. This is what
 * the Identity Service's getCurrentSession() (docs/core-services.md §1)
 * is built on. Applied globally in src/index.ts — individual routes that
 * require authentication use `requireAuth` below, not this middleware
 * directly.
 */
export const resolveSession: MiddlewareHandler<AppEnv> = async (c, next) => {
  const result = await auth.api.getSession({ headers: new Headers(c.req.header()) });
  c.set("session", result?.session ?? null);
  c.set("user", result?.user ?? null);
  await next();
};

/**
 * Route-level guard. Throws UnauthorizedError (mapped to 401 by
 * error-handler.middleware.ts) if resolveSession didn't find a valid
 * session. Must run after resolveSession in the middleware chain.
 */
export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  if (!c.get("session") || !c.get("user")) {
    throw new UnauthorizedError();
  }
  await next();
};

/**
 * Narrows `c.get("user")` from `AuthUser | null` to `AuthUser` for use
 * inside a route handler mounted after `requireAuth`. TypeScript can't
 * infer the non-null guarantee across the middleware boundary on its own;
 * this is the one place that gap is bridged, so route handlers never each
 * write their own defensive null check (or worse, a non-null assertion).
 */
export function requireUser(c: Context<AppEnv>): AuthUser {
  const user = c.get("user");
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}
