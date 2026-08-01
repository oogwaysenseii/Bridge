# Bridge — API Conventions

## Internal client↔server calls: Hono RPC
Since the frontend and backend are both TypeScript, internal calls from the React app to the Hono backend use **Hono's built-in RPC client**, not hand-written `fetch` + duplicated types. The Hono app's route types are exported and consumed directly by the client, giving full type inference (request shape, response shape, path params) with zero manually-synced interfaces. See ADR-007.

Zod schemas still validate at the server boundary (never trust the client), and the same Zod schema is reused by React Hook Form on the client — the RPC layer removes the *duplicated type definition*, not the validation itself.

## Public / external API: REST
Anything intended to be called by non-TypeScript clients later (a public API, webhooks, a future native mobile app not sharing the TS toolchain) is exposed as plain REST under `/api/v1/{module}`, documented with the same Zod schemas via generated OpenAPI output. This is not built at MVP — the convention is defined now so internal RPC usage doesn't paint the backend into a TS-client-only corner.

## Versioning
`/api/v1/...` from the start. No deprecation policy is needed until a `v2` exists; when it does, `v1` gets a documented sunset window before removal, not an immediate break.

## Pagination
Cursor-based everywhere (`?cursor=&limit=`), no offset pagination, from day one — including on tables with low volume at MVP (offset pagination breaking under scale is a common "have to redesign later" mistake, so it's not deferred just because early volume doesn't require it).

## Errors
A single `AppError` class per module, mapped to HTTP status codes in one place (`core/errors`). Modules throw domain errors (`NotFoundError`, `ForbiddenError`, `ValidationError`); the mapping to HTTP status is centralized so it isn't reinvented per route.

## Authorization on every write
Every mutating route calls `PermissionService.requirePermission(...)` (see `core-services.md`) before executing — this is enforced at the route/service boundary, not left to individual handlers to remember.

## Rate limiting
Hono middleware layer. Naive in-memory limiter at MVP (acceptable given single-instance deployment at that stage), upgraded to Redis-backed limiting when running multiple instances. Applied by default to auth endpoints, messaging, and listing creation — the platform's clearest abuse surfaces.
