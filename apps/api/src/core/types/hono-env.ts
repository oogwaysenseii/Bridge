import type { Logger } from "../observability/logger";
import type { AuthSession, AuthUser } from "../auth/auth";

/**
 * Hono's context `Variables` generic, used everywhere the app is
 * constructed or a route handler needs typed access to `c.get(...)`.
 * Centralized here so every module's routes share one contract instead of
 * redeclaring it.
 */
export interface AppVariables {
  requestId: string;
  logger: Logger;
  /** Populated by the auth middleware; null for unauthenticated requests. */
  session: AuthSession | null;
  user: AuthUser | null;
}

export interface AppEnv {
  Variables: AppVariables;
}
