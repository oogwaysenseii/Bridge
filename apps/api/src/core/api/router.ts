import { Hono } from "hono";
import type { AppEnv } from "../types/hono-env";
import { requireAuth, requireUser } from "../auth/auth.middleware";
import { IdentityServiceImpl } from "../services/identity/identity.service";
import { DrizzleIdentityRepository } from "../services/identity/identity.repository";
import { defaultCache } from "../cache/redis-cache";
import { NotFoundError } from "../errors/app-error";

/**
 * Wired here, not inside identity.service.ts itself — see that file's own
 * comment for why. This is the composition root for the Identity Service:
 * the one place its concrete production dependencies (a real Postgres-backed
 * repository, the real Redis cache) are actually constructed. router.ts is
 * only ever imported by index.ts, the real server entry point — never by a
 * unit test — so triggering real infrastructure construction (and the
 * env-validation fail-fast behavior that comes with it) here is correct,
 * not a problem to work around.
 */
const identityService = new IdentityServiceImpl(new DrizzleIdentityRepository(), defaultCache);

/**
 * Core, non-feature-module routes. This is deliberately small at Phase 1:
 * a health check for infra/load-balancer probes, and a `/me` endpoint that
 * demonstrates the Identity Service being consumed through a real
 * authenticated route (used by the web app's dashboard page). Feature
 * modules (feed, marketplace, ...) get their own routers starting Phase 3,
 * mounted alongside this one in index.ts — this file does not grow to
 * contain them.
 */
export const coreRouter = new Hono<AppEnv>()
  .get("/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
  })

  .get("/v1/me", requireAuth, async (c) => {
    const user = requireUser(c);

    const [identityUser, profileSummary] = await Promise.all([
      identityService.getUserById(user.id),
      identityService.getProfileSummary(user.id),
    ]);

    if (!identityUser) {
      throw new NotFoundError("User", user.id);
    }

    return c.json({
      user: {
        id: identityUser.id,
        email: identityUser.email,
        emailVerified: identityUser.emailVerified,
        status: identityUser.status,
      },
      // Null until Phase 2 (profile creation is part of the Phase 2 scope,
      // not Phase 1) — the web app's dashboard handles this explicitly,
      // it is not an error state.
      profile: profileSummary,
    });
  });

export type CoreRouterType = typeof coreRouter;
