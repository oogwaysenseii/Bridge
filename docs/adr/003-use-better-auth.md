# 003 — Use Better Auth instead of Firebase Auth / Clerk

## Context
Authentication is the spine of Bridge's single-identity model — every module depends on it. The original brief called for Better Auth if the environment supports it, with Firebase Auth as a documented fallback if not.

## Decision
Use Better Auth. The "AI Studio limitation" that motivated the fallback clause does not apply in this environment — Better Auth is a standard TypeScript library compatible with Hono/Drizzle/Postgres.

## Alternatives Considered
- **Firebase Auth** — managed, batteries-included, but couples identity data to a third-party platform outside Postgres, complicating the "one identity, one graph" model this whole project is built around.
- **Clerk** — excellent DX and managed UI components, but similarly externalizes identity data and adds a paid dependency early.
- **Supabase Auth** — reasonable middle ground, but implies Supabase as the Postgres host, constraining the deployment decision prematurely.

## Tradeoffs
- Better Auth is a smaller, newer project than Clerk/Firebase — less battle-tested at scale, smaller community for troubleshooting.
- Self-hosting auth means Bridge owns password-reset flows, session security, and rate limiting on auth endpoints, rather than inheriting them from a managed provider.

## Consequences
Phase 1 must include an explicit auth-hardening pass (rate-limited login, mandatory email verification, session rotation) rather than treating auth as "wired up and done." This is called out explicitly in the Phase 1 scope so it isn't skipped.

## Update (Phase 1 dependency audit)
The initial implementation pinned `better-auth` as `^1.0.0` — an open range. A real `pnpm install` resolved this to `1.6.25`, which had moved its peer requirements (`drizzle-orm`, `drizzle-kit`, and transitively `zod` via `better-call`) well past what the rest of the workspace was pinned to, blocking install entirely. Consequence: `better-auth` is now **exact-pinned** (`1.6.25`) in both `apps/api` and `apps/web`, rather than left on a caret range. This is a deliberate, permanent deviation from this repo's normal versioning convention for this one package specifically — its peer-requirement surface has already demonstrated it can shift between minor versions in a way that breaks the build, so upgrading it is now a reviewed, explicit action (bump the pin, re-audit peers) rather than something that happens implicitly on a routine `pnpm install`. See `docs/dependency-audit.md` for the full resolution.
