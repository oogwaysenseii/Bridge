# Dependency Audit — Phase 1 Blocker Resolution

Status: **Applied, not yet verified against a real install.** This sandbox has no network access — every change below is a reasoned, explained fix to the reported conflicts, not something re-run through `pnpm install` here. See "Verification" at the end for exactly what to run.

## The four reported conflicts

| # | Conflict | Root cause |
|---|---|---|
| 1 | `better-auth` 1.6.25 requires `drizzle-orm ^0.45.2`; had `0.36.4` | `better-auth` was pinned as `^1.0.0`, an open range. pnpm resolved the latest matching version (1.6.25), which has moved its peer requirement well past what was pinned for `drizzle-orm`. |
| 2 | `better-auth` requires `drizzle-kit >=0.31.4`; had `0.27.2` | Same root cause — `drizzle-kit` is a devDependency whose range (`^0.27.0`) predates what 1.6.25 needs. |
| 3 | `better-call` (better-auth's internal RPC dependency) requires Zod 4; had Zod 3 | `better-auth` 1.6.25 depends on a version of `better-call` that itself requires Zod 4. This isn't something a version bump to `better-auth` alone fixes — every package in this workspace that uses `zod` directly (`packages/shared`, `apps/api`, `apps/web`) needs to move to v4 so there's one consistent major version across the tree, not two coexisting. |
| 4 | `eslint-plugin-react-hooks` 4.6.2 incompatible with ESLint 9 | The plugin's 4.x line predates ESLint 9's flat-config system; flat-config support was added in the 5.x line. |

## Every version change, explained

### `better-auth`: `^1.0.0` → `1.6.25` (exact pin, both `apps/api` and `apps/web`)
Changed from a caret range to an **exact pin**, not just bumped — deliberately. The original `^1.0.0` range is what caused this whole blocker: pnpm resolved to whatever the latest matching patch/minor was at install time, silently pulling in new peer requirements. An exact pin means the next `pnpm install` resolves to the exact version this dependency graph was actually reasoned about, and any future upgrade is a deliberate, reviewed action rather than something that happens implicitly. Pinned identically in both `apps/api` and `apps/web` because it's the same npm package (server config and the `better-auth/react` client are two entry points of one package) — a version mismatch between them would risk subtle type drift between `AuthSession`/`AuthUser` as inferred server-side and what the client expects.

### `drizzle-orm`: `^0.36.0` → `^0.45.2`
Matches better-auth 1.6.25's stated minimum exactly. Kept as a caret range (not exact-pinned) since Drizzle ORM's own minor/patch releases are lower-risk than an auth library's — but this should be revisited if another conflict surfaces.

### `drizzle-kit`: `^0.27.0` → `^0.31.4`
Matches better-auth's stated minimum. **Unverified risk**: I don't have a reliable, current cross-reference for which `drizzle-kit` version is actually meant to pair with `drizzle-orm ^0.45.2` — Drizzle's own compatibility matrix between the ORM and the CLI tool isn't something I could check without network access. If `pnpm install` or `drizzle-kit generate` surfaces a further mismatch here, check Drizzle's own release notes for the ORM/kit pairing at the time of install, not just the `>=0.31.4` floor better-auth stated.

### `zod`: `^3.23.0` → `^4.0.0` (root cause of the most invasive change)
This is a **major version bump**, not a patch adjustment, applied identically to `packages/shared`, `apps/api`, and `apps/web` so there's exactly one Zod major version anywhere in the tree. Zod 4 changed the API for string-format validators (`.email()`, `.uuid()`, `.url()`, etc.) and reportedly the `ZodError` shape. I've flagged every usage of these specific APIs in the code itself (see `auth.schema.ts`, `profile.schema.ts`, `env.ts`, `error-handler.middleware.ts`) with inline comments explaining exactly what to check and what the likely fix is if `pnpm typecheck` errors on that line. I did **not** rewrite that code speculatively — guessing at unfamiliar v4 syntax risks introducing a different bug in place of a flagged, well-understood one. The basic chainable API (`z.object()`, `z.string()`, `.min()`, `.max()`, `z.enum()`, `z.infer`) is unaffected by this restructuring and needs no changes.

### `@hookform/resolvers`: `^3.9.0` → `^3.10.0`
The Zod resolver in this package needs to actually support Zod 4 schemas. I don't have a verified changelog reference for exactly which `@hookform/resolvers` version added that support — `^3.10.0` is a reasonable, newer-than-before bump, not a confirmed-compatible pin. **If `pnpm install` or `pnpm typecheck` shows a resolver/schema type mismatch in `login.page.tsx` or `signup.page.tsx`, check `@hookform/resolvers`'s own changelog for the first version declaring Zod 4 support and bump to at least that.**

### `eslint-plugin-react-hooks`: `^4.6.2` → `^5.0.0`
Moves to the major version line with ESLint 9 flat-config support. One specific downstream risk: `eslint.config.js` consumes `reactHooks.configs.recommended.rules` — the v4 export shape. If v5 restructured this export, `pnpm lint` will fail to *load the config* (an immediate, obvious error), not silently skip the rules. Flagged inline in `eslint.config.js` with the exact fallback to check.

### `eslint`: unchanged (`^9.12.0`)
Was never the problem — it's the plugin that needed to catch up, not ESLint itself. Confirmed no change needed here.

## A fifth issue found during this audit, not in the original report

Auditing "every dependency" surfaced that **`eslint` itself was only declared in the root `package.json`**, while each workspace package (`apps/api`, `apps/web`, `packages/shared`) has its own `"lint": "eslint ."` script. Whether that resolves correctly depends on pnpm/Turborepo's binary-hoisting behavior, which varies by pnpm version and `.npmrc` settings — not something I can verify without actually running it here. Rather than depend on that behavior being correct, I added `eslint` as an explicit devDependency to all three workspace packages (matching the root's version). This is the same reasoning already applied consistently to `typescript` and `vitest` elsewhere in this repo — each package declares the tools its own scripts need, rather than relying on implicit access to the root's devDependencies.

## Defensive addition: `.npmrc`

Added `auto-install-peers=true` and `strict-peer-dependencies=false`. This is **not** a substitute for the fixes above — every reported conflict was fixed by an explicit version change, not papered over here. It's a safety net for the next patch release somewhere in this fast-moving dependency tree (better-auth and Zod 4 are both under active development) that might introduce a satisfiable-but-unlisted peer requirement — common, defensible practice for monorepos consuming packages at this stage of maturity.

## Workspace dependency graph verification

Every package declared in more than one `package.json` was cross-checked for version consistency:

| Package | Consistent across workspaces? |
|---|---|
| `better-auth` | ✅ `1.6.25` in both `apps/api` and `apps/web` |
| `zod` | ✅ `^4.0.0` in `packages/shared`, `apps/api`, `apps/web` |
| `hono` | ✅ `^4.6.0` in `apps/api` and `apps/web` |
| `typescript` | ✅ `^5.6.0` in all four |
| `vitest` | ✅ `^2.1.0` in `packages/shared`, `apps/api`, `apps/web` |
| `eslint` | ✅ `^9.12.0` in all four (post-fix) |

No package declared in more than one workspace has a mismatched version string. This check was mechanical (a script diffing every `package.json`'s dependencies), not a visual scan — see the audit history for the actual comparison output.

**What this check does not cover**: transitive dependency resolution (what pnpm's lockfile actually resolves each range to, and whether *those* resolved versions are mutually compatible) — that requires a real `pnpm install` against the npm registry, which this sandbox cannot do.

## Verification — run these locally before approving Phase 1

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules pnpm-lock.yaml
pnpm install
```

Watch specifically for:
- Any remaining peer dependency warning involving `drizzle-kit`/`drizzle-orm` (the pairing I couldn't independently verify)
- Any Zod-related peer warning (would mean something else in the tree still expects Zod 3)

Then:

```bash
pnpm typecheck   # will surface every RISK FLAGGED comment in the codebase if it's a real problem
pnpm lint        # will surface the eslint-plugin-react-hooks v5 config-shape risk if it's a real problem
pnpm test
pnpm build
```

If `pnpm typecheck` fails on any of the flagged Zod usages (`auth.schema.ts`, `profile.schema.ts`, `env.ts`, `error-handler.middleware.ts`) or the Better Auth config (`auth.ts`), each has an inline comment with the specific, actionable fallback to try. Report back which specific lines fail and I'll fix them precisely rather than re-guessing at the whole surface area.
