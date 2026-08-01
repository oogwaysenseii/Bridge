# Phase 1 Report — Project Setup, Auth, Design System, Routing

Status: **Not approved.** A real `pnpm install` surfaced four dependency conflicts (better-auth's actual peer requirements vs. what was pinned). See [`dependency-audit.md`](./dependency-audit.md) for the full resolution — every version change explained, the workspace dependency graph re-verified for internal consistency, and several Zod 3→4 API risk areas flagged inline in the affected code. This report's content below (scope, tests, security/performance review) still reflects what was built; the dependency audit is an addendum, not a rewrite of this document.

**Approval gate, per the project's own Definition of Done**: `pnpm install` with zero dependency conflicts, `pnpm typecheck`, `pnpm lint`, `pnpm test`, and a successful build — all against a real toolchain this sandbox does not have. Not yet run.

## Scope implemented

Per `architecture.md` §7 (as amended by §8/§9) and `roadmap.md`'s Phase 1 row:

1. Turborepo monorepo: `apps/api`, `apps/web`, `packages/shared`, pnpm workspaces
2. Drizzle schema for all MVP tables (identity, media, social, marketplace, messaging, notifications, activity_log) — `reviews` correctly excluded per the reclassification in this project's history (documented, not migrated, consistent with ADR-008)
3. Better Auth wired to the Drizzle/Postgres adapter, with the hardening pass: mandatory email verification, session sliding expiry, rate-limited auth endpoints, secure cookies in production
4. Redis client + `Cache` interface (testability seam)
5. BullMQ queue infrastructure (factory only — no jobs; Media Service, the first consumer, is Phase 2 per roadmap.md)
6. Email provider interface + `ConsoleEmailProvider` (dev default), vendor selection still open per `deployment.md`
7. Identity Service + Permission Service (Core Platform Services, `core-services.md` §1 and §6), both with full unit test coverage
8. Tailwind design tokens (light/dark), shadcn-style primitives, dark mode with persistence, app shell
9. Routing skeleton + protected-route pattern
10. Hono RPC end to end (`AppType` exported from the API, consumed type-only by the web client)
11. Vitest (both apps) + Playwright configured, with real tests
12. Sentry init + structured logging (pino), wired at `core/`

## Tests written

- `identity.service.test.ts` — cache hit/miss/invalidation, using injected fakes (no real Redis needed)
- `permission.service.test.ts` — every policy gets an allow and a deny case, plus `requirePermission`'s throw behavior
- `cn.test.ts`, `button.test.tsx` — utility and primitive component behavior
- `theme-provider.test.tsx` — dark mode toggling, persistence, system-preference default, error boundary
- `e2e/smoke.spec.ts` — shell renders, public-page navigation, unauthenticated dashboard redirect, dark mode toggle

None of these have been executed by a real test runner in this environment — see "Sandbox limitations" below.

## Bugs found and fixed during self-review (not shipped as originally written)

1. `Button` was used with an `asChild` prop that doesn't exist in this codebase (no Radix Slot dependency) — fixed to style `Link` via exported `buttonVariants`.
2. `auth.ts`'s comments referenced a `schema` mapping and `user.additionalFields` config that were never actually written — added.
3. `accounts.passwordHash` was named inconsistently with Better Auth's conventional `password` field — renamed. A table-name mapping doesn't remap individual field names within it, so this would have broken credential storage silently.
4. `PASSWORD_MIN_LENGTH` was defined independently in both `@bridge/shared` and `auth.ts` with matching values today but no shared source — consolidated to import from `@bridge/shared`, and added the missing `PASSWORD_MAX_LENGTH` server-side enforcement to match.
5. Eight `.tsx` files referenced `React.JSX.Element`/`React.ReactNode` as a type without importing `React` — a real compile error. Fixed in `App.tsx`, `header.tsx`, `theme-toggle.tsx`, `app-shell.tsx`, `protected-route.tsx`, `theme-provider.test.tsx`, `landing.page.tsx`, `dashboard.page.tsx`.
6. `apps/api/package.json` had `build`/`dev` but no `start` script — no way to run the compiled output. Added.
7. `tsconfig.base.json` sets `noEmit: true` for every package (correct for `apps/web`'s Vite build and `packages/shared`'s source-consumption model) — but `apps/api` needs `tsc` to actually emit to `dist/`. Overrode `noEmit: false` there.
8. `apps/web`'s `tsc -b && vite build` script would have failed outright: referenced project (`tsconfig.node.json`) lacked `composite: true`, which TypeScript project references require. Restructured into the standard solution-file + `tsconfig.app.json` + `tsconfig.node.json` pattern, with `composite: true` and the resulting required `noEmit: false` on both.
9. `apps/web`'s `typecheck` script (`tsc --noEmit`) would have checked nothing after the above restructuring, since the root `tsconfig.json` became an empty solution file. Changed to `tsc -b`.
10. `tsconfig.node.json` included `postcss.config.js` without `allowJs` set — `tsc` errors on a `.js` file included without that flag. Removed it from the include list (PostCSS loads it via Node's own resolution regardless).

## Security review

**Solid:**
- Mandatory email verification before an account is treated as a real identity (ties directly to VISION.md's identity-integrity thesis)
- Rate limiting on `/api/auth/*` (naive in-memory, documented single-instance limitation — see api.md)
- CORS restricted to a single configured origin with credentials, not a wildcard
- Secure cookies enforced in production (`NODE_ENV` gated)
- Password policy enforced identically client- and server-side from one shared constant (post-fix)
- `AppError`'s `userMessage`/`message` split means internal error detail never reaches the client; 5xx errors are logged server-side before a generic message goes out
- All DB access through Drizzle's parameterized queries — no raw string-concatenated SQL anywhere in the codebase
- `ConsoleEmailProvider` throws at construction if `NODE_ENV=production`, so a misconfigured production deploy fails loudly at startup instead of silently no-op-ing password reset emails

**Flagged, unverified in this sandbox (see below):**
- Better Auth's `schema`/`additionalFields` API shape for the pinned version
- Whether Better Auth's CSRF protections are sufficient as-is (assumed handled internally, not independently reviewed)
- `status` as a Postgres enum vs. Better Auth writing it as a plain string — see auth.ts's file-level comment for the fallback if this breaks

## Performance notes

- `resolveSession` middleware runs on every request, including public ones (`/`, `/health`) — a small per-request cost (session cache lookup) even for unauthenticated traffic. Acceptable at MVP scale; worth revisiting if `/health` is hit at high frequency by infra probes.
- `getProfileSummary` is Redis-cached (5 min TTL) since it's the highest-fanout Identity Service call across future modules — this was a deliberate Phase 1 design choice, not deferred.
- No N+1 query patterns introduced — the only real query path today (`/v1/me`) does two independent lookups in parallel (`Promise.all`).

## Accessibility review

- Visible focus rings enforced globally (`:focus-visible` in `globals.css`), not per-component
- `prefers-reduced-motion` respected globally
- Form errors use `role="alert"`, associated inputs have `<Label htmlFor>` pairing
- Theme toggle has an accessible label reflecting current state
- Not yet verified: color contrast ratios for the chosen token values against WCAG AA — should be checked with a real contrast tool once the app renders, not calculated by hand here

## Documentation updated

- `roadmap.md` — Phase 1 marked implemented/pending review, linking here
- This document (new)
- No ADRs were added — the bugs fixed above are implementation corrections within already-decided architecture, not new architectural decisions
- No contradictions found between what was built and the frozen v1.2 architecture docs

## Technical debt intentionally introduced or deferred

- `activity_log.metadata` is untyped JSONB (`jsonb("metadata")`, no `.$type<>()`) — reasonable since shape varies per event type, but could get a `Record<string, unknown>` type hint later for marginally better DX.
- `drizzle.config.ts` sits outside `apps/api/src`, so it isn't covered by any tsconfig `include` and therefore isn't type-checked by `pnpm typecheck` — drizzle-kit executes it via its own loader regardless, so this doesn't block functionality, just typecheck coverage.
- The `@typescript-eslint/no-magic-numbers` rule (warn-level) will produce noisy warnings on legitimate named-constant declarations throughout the codebase (e.g. `const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;` still flags the literals inside). Non-blocking (warn, not error) but worth either loosening the rule or accepting the noise — a decision for a follow-up, not fixed here since it would mean touching many unrelated lines.
- Rate limiting is in-memory/single-instance by design (documented in api.md) — must move to Redis-backed before running more than one API instance.

## Sandbox limitations — commands to run locally for real verification

This sandbox has no network access and no installed Postgres/Redis/pnpm. Every fix above is the result of manual code review, not tool execution. Run these locally (or in Claude Code) before treating Phase 1 as verified:

```bash
# Install
pnpm install

# Start local infra
docker compose up -d

# Type-check everything (this is the real test of every tsconfig fix above)
pnpm typecheck

# Lint
pnpm lint

# Unit tests
pnpm test

# Generate and run the first migration
pnpm --filter @bridge/api db:generate
pnpm --filter @bridge/api db:migrate

# Start the API, then the web app, then run e2e
pnpm --filter @bridge/api dev
pnpm --filter @bridge/web dev
pnpm --filter @bridge/web test:e2e
```

If `pnpm typecheck` on `@bridge/api` fails specifically around Better Auth's `schema`/`additionalFields` options, that's the flagged risk in `auth.ts` surfacing — check the installed `better-auth` version's current docs for the exact expected shape.
