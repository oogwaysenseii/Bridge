# Bridge — Architecture & Design Document

Status: **FROZEN v1.2** — see §9. No implementation until Phase 1 begins per this document.

Related documents: product rationale lives in [`VISION.md`](./VISION.md); infrastructure-vs-feature-module services are detailed in [`core-services.md`](./core-services.md); full schema in [`database.md`](./database.md); API conventions in [`api.md`](./api.md); every non-trivial decision below has a corresponding record in [`adr/`](./adr/).

---

## 1. Guiding Principle

Bridge is one identity graph, not a bundle of apps. Every entity hangs off `users` (directly or via `profiles`), and every future module (companies, jobs, courses, events, groups, dating, reviews, AI) is a set of tables and a feature folder that plugs into that graph — never a bolt-on schema.

Two architectural commitments follow from that:

1. **Identity is the spine.** `user_id` is a foreign key on almost every table in the system, including future ones.
2. **Modules are isolated but not siloed.** Each feature owns its own API/service/repository/UI, but nothing prevents cross-module joins at the data layer (e.g., a job listing referencing a company, which references a user).

---

## 2. Tech Stack Decisions

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 19 + Vite + TS | Fast HMR, first-class TS, React 19's `use()`/actions simplify data-fetching boilerplate |
| Styling | Tailwind + shadcn/ui | Utility-first + unstyled accessible primitives = consistent premium UI without a heavy design-system framework |
| Motion | Framer Motion | Declarative, used sparingly for page/element transitions, not decoration |
| Server state | TanStack Query | Caching, pagination, optimistic updates for feed/marketplace/chat |
| Forms | React Hook Form + Zod | Shared Zod schemas between client validation and server validation (single source of truth) |
| Backend | Hono | Lightweight, edge-compatible, first-class TS, easy middleware model, good fit for feature-module routing |
| Auth | Better Auth | Full control over session model, works with Drizzle/Postgres directly, no vendor lock-in — important since Bridge's identity model is central to everything |
| DB | PostgreSQL | Relational integrity is essential for a graph of connected entities; JSONB available for flexible/future fields |
| ORM | Drizzle | Typesafe schema-as-code, lightweight migrations, no heavy runtime — matches "typed end to end" goal |
| Storage | S3-compatible object storage (e.g., Cloudflare R2 or S3) | Standard, portable, works with signed uploads |
| Images | Sharp (server-side) for compression + responsive size generation on upload | Avoids client-side inconsistency, keeps original untouched |

**Not decided yet, needs your input:** actual deployment target (Vercel/Fly/Railway/self-hosted?) and object storage provider — this affects the storage adapter interface design below.

---

## 3. Clean Architecture: Folder Structure

```
src/
  core/                      # cross-cutting: db client, env config, logger, error types, DI container
    db/
      client.ts
      schema/                # drizzle schema files, one per domain, barrel-exported
    config/
    errors/
    middleware/
    services/                # Core Platform Services — see core-services.md
      identity/
      media/
      activity/
      notification/
      search/
      permission/
      # recommendation/      # future, documented not implemented

  modules/
    auth/
      api/                   # Hono route handlers
      services/              # business logic, framework-agnostic
      repositories/          # Drizzle queries only, no business logic
      validation/            # Zod schemas (shared with frontend via a shared package)
      ui/                    # React components/hooks/pages for this module

    users/                   # profiles, followers/following, settings
    media/                   # upload pipeline, image processing, storage adapter
    feed/                    # posts, comments, likes
    marketplace/             # listings, categories, favorites
    chat/                    # conversations, messages, realtime
    notifications/
    search/
    admin/

    future/                  # scaffolded, schema-ready, routes stubbed/disabled
      companies/
      groups/
      events/
      jobs/
      courses/
      dating/
      reviews/
      ai/

  shared/
    ui/                      # design-system primitives built on shadcn (Button, Card, Avatar, etc.)
    hooks/
    lib/
    types/
```

**Rule enforced by structure:** a `ui/` folder never imports another module's `repositories/` or `services/` directly — only through that module's public `api/` contract or a shared type. This is what keeps modules pluggable.

**Dependency injection:** kept lightweight — services receive their repository as a constructor argument (or factory function), not a full DI framework. This is enough to swap implementations (e.g., mock repository in tests) without the overhead of a DI container, which would be overkill at this stage and can be introduced later if the codebase truly needs it.

---

## 3a. Core Platform Services

Feature modules (`marketplace`, `feed`, `chat`, ...) own user-facing capability. **Core Platform Services** own cross-cutting infrastructure every module depends on: Identity, Media, Activity, Notification, Search, Permission, and (future) Recommendation. They live in `src/core/services/`, never in `src/modules/`, and dependencies only flow modules → core services, never the reverse.

Modules communicate with each other **only** through the Activity Service's event mechanism (record → subscribe), not by calling one another's services directly — this is what keeps future modules (companies, jobs, events, groups, dating, reviews) pluggable without modifying existing module code.

Full responsibilities, interfaces, dependencies, and the cross-module event flow are documented in [`core-services.md`](./core-services.md). This is now a permanent part of the frozen architecture, not an optional pattern.

---

## 4. Database Schema (Core + Future-Proofed)

All tables: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `created_at`, `updated_at`, `deleted_at NULLABLE` (soft delete), appropriate indexes/FKs.

### Identity core
```
users
  id, email, phone, password_hash (nullable if OAuth-only), email_verified_at, status, last_login_at

profiles
  id, user_id (FK, unique), display_name, username (unique), bio, avatar_media_id, cover_media_id,
  location, website_url, visibility (enum: public/connections/private)

follows
  id, follower_id (FK users), following_id (FK users), created_at
  unique(follower_id, following_id)
```

### Media (shared by every module)
```
media
  id, owner_user_id, url, type (image/video/doc), width, height, size_bytes,
  variants JSONB  -- {thumb, small, medium, large} generated on upload
```
Every module references media by `media_id` rather than storing its own image logic — this is the single point of change when storage providers change.

### Social
```
posts        id, author_id, content, media_ids UUID[] (or join table if you want per-post ordering), visibility
comments     id, post_id, author_id, parent_comment_id (nullable, for threads), content
likes        id, user_id, likeable_type (enum), likeable_id  -- polymorphic, reused by posts/comments/listings/reviews later
```
Using a polymorphic `likeable_type/likeable_id` pair now avoids a `post_likes`, `comment_likes`, `listing_likes` table explosion later. Enforced at the app layer (Zod + service), not a DB-level polymorphic FK (Postgres can't do that natively) — this is a deliberate tradeoff: slightly less referential integrity in exchange for one reusable mechanism across all current and future modules.

### Marketplace
```
listing_categories   id, name, slug, parent_id (nullable, self-referencing for subcategories)
listings             id, seller_id, category_id, title, description, price_cents, currency, condition, status, location
listing_images       id, listing_id, media_id, position
favorites            id, user_id, favoritable_type, favoritable_id  -- same polymorphic pattern as likes
```

### Messaging
```
conversations         id, type (direct/group/marketplace), context_type (nullable: 'listing'), context_id (nullable)
conversation_members   id, conversation_id, user_id, role, joined_at, last_read_at
messages               id, conversation_id, sender_id, content, media_id (nullable), status
```
`context_type/context_id` is how a marketplace chat ties back to a `listing` without messaging needing to know marketplace internals beyond an opaque reference.

### Activity (backs the Activity Service — see core-services.md)
```
activity_log   id, actor_id, event_type, subject_type, subject_id, metadata JSONB, created_at
```
Append-only. No `deleted_at` — this is a durable event log, not a mutable record. Indexed on `(subject_type, subject_id)` and `(event_type, created_at)`.

### Notifications
```
notifications   id, recipient_id, actor_id, type (enum: like/comment/message/follow/...), 
                subject_type, subject_id, delivery_channel (enum: in_app/push/email, default in_app), read_at
```

### Reviews (polymorphic target, ready for companies/listings/jobs later)
```
reviews   id, author_id, reviewable_type, reviewable_id, rating, content
```

### Future modules (schema stubbed now, not wired into routes)
```
companies         id, owner_user_id, name, slug, description, logo_media_id
company_members   id, company_id, user_id, role

groups            id, owner_user_id, name, description, visibility
group_members     id, group_id, user_id, role

events            id, host_id, host_type (user/company), title, starts_at, ends_at, location
event_attendees   id, event_id, user_id, status

jobs              id, company_id, posted_by_user_id, title, description, employment_type, location
job_applications  id, job_id, applicant_id, status

courses           id, instructor_id, title, description
course_enrollments id, course_id, user_id, progress

dating_profiles   id, user_id (FK, unique), preferences JSONB, visibility
```

All of these already connect through `user_id` / the polymorphic `likes`/`reviews`/`favorites`/`notifications` patterns, so wiring them in later is additive — new tables, new module folder, no schema surgery on existing tables.

---

## 5. API Design Convention

- Every module exposes routes under `/api/v1/{module}`.
- Request/response shapes validated with the same Zod schema used on the frontend form (imported from `modules/{name}/validation`).
- Pagination: cursor-based (`?cursor=&limit=`) everywhere from day one — offset pagination on a feed table is one of the most common "have to redesign later" mistakes, so it's not deferred.
- Errors: a single `AppError` class per module mapped to HTTP status in one place (`core/errors`), so error handling isn't reinvented per route.

---

## 6. Known Scalability Considerations (flagged now, not solved now)

- **Polymorphic likes/favorites/reviews** trade some DB-level integrity for schema reuse — fine at MVP scale, but at high volume you'd eventually consider materialized counters (`like_count` on posts) updated via triggers or async jobs rather than `COUNT(*)` on read.
- **Feed generation**: MVP can do a simple "posts from people you follow, sorted by time" query. At scale this becomes a fan-out or ranking service — the `feed/` module boundary is drawn specifically so that swap doesn't touch `posts`/`follows` tables.
- **Realtime chat**: needs a websocket/SSE layer that Hono itself doesn't provide out of the box — will need a decision (e.g., a dedicated realtime service, or a provider like Ably/Pusher/Supabase Realtime) before Phase 5. Not blocking now, but worth deciding before marketplace chat is built so we don't build twice.
- **Image variants**: generating all responsive sizes synchronously on upload will not scale past a small user base — plan is synchronous for MVP simplicity, with a clear seam (`media` service) to move to a background job queue later without touching callers.

---

## 7. Proposed Phase 1 Scope (per "one phase at a time") — REVISED, see §8

1. Monorepo scaffold via **Turborepo (pnpm workspaces)** — frontend + backend + shared package for Zod schemas/types
2. Drizzle schema for **core + Phase 1–7 tables only** — future-module tables (companies, jobs, courses, events, groups, dating, reviews target types) stay documented in §4 but are **not migrated** until their module is actually built
3. Better Auth wired into Hono + Drizzle adapter, with explicit hardening pass (rate-limited login, verified email required, session rotation)
4. **Redis** added alongside Postgres from day one (sessions cache, later reused for queue + rate limiting)
5. **BullMQ** (or equivalent) job queue scaffolded, even if only used for image variant generation at first
6. Transactional email provider decided and wired (blocks auth email verification/reset)
7. Base design system (Tailwind theme, shadcn install, dark mode, layout shell)
8. Routing skeleton + protected route pattern
9. **Vitest** for unit/service tests, **Playwright** for e2e — configured, not exhaustively written yet
10. Sentry (or equivalent) + structured logging wired at the `core/` level
11. Client↔server calls use **Hono RPC** (typed, no duplicated Zod-to-fetch boilerplate) instead of plain untyped REST calls internally
12. **Identity Service and Permission Service scaffolded in `core/services/`** — auth and authorization checks start in Phase 1, so these can't be deferred; Activity, Notification, Media, Search, and Recommendation services are scaffolded when the module that first needs them is built (Media in Phase 2 with avatar upload, Activity/Notification in Phase 3 with posts, Search in Phase 7)

Nothing beyond this until Phase 1 is reviewed.

---

## 8. Architecture Review & Freeze (v1.1)

A full adversarial review was conducted before implementation. Summary of changes from v1:

| Area | Change | Reason |
|---|---|---|
| Client↔server calls | REST → **Hono RPC** for internal calls | Eliminates duplicated type definitions between client and server |
| Caching | **Redis added to Phase 1** | Sessions, feed reads, chat presence all need it; retrofitting later touches every module |
| Background jobs | **BullMQ (or equivalent) added to Phase 1** | Image processing, notification fan-out, email sending must not block request/response cycles |
| Email | **Transactional email provider decided in Phase 1** | Auth email verification/reset cannot function without it — this was a blocking gap, not a "later" item |
| Content moderation | **Moderation hook added to `media` service**, before Phase 4 (Marketplace images) | Legal/safety requirement for any platform accepting user-uploaded images |
| Observability | **Sentry + structured logging added to Phase 1** | Required for "millions of users" claim to be credible; expensive to retrofit |
| Push notifications | `notifications` schema gets a `delivery_channel` field; adapter interface stubbed | Design philosophy states mobile-first; in-app-only notifications contradict that |
| Testing | **Vitest + Playwright named and configured in Phase 1** | Project's own rule requires each phase be "tested" before moving on — needs tooling in place from the start |
| Monorepo tooling | **Turborepo + pnpm workspaces** | Was implied, never decided |
| Future-module tables | **Documented but not migrated** until each module is actually built | Avoids maintaining unused, drifting schema; design intent is preserved in §4, migration cost is deferred |
| Polymorphic likes/favorites/reviews | **Hard rule: entities referenced polymorphically are never hard-deleted**, only soft-deleted; periodic integrity-sweep job named as a Phase 6+ task | Prevents silent orphaned rows without giving up the schema-reuse benefit |
| GDPR / right-to-erasure | **Hard-purge job** (scrub PII N days after soft-delete, anonymize rather than break FKs) named as a companion process to the soft-delete convention | Soft-delete alone doesn't satisfy erasure requirements |
| Messages table growth | **Partitioning plan** (by `conversation_id` or time) documented as a Phase 5+ concern | Unbounded growth on a hot-read table; plan needs to exist before it's urgent |
| Rate limiting | Added at Hono middleware layer, naive/in-memory for MVP, Redis-backed later | Messaging and listings are both spam/abuse surfaces |

**Confirmed as-is, no change:** Clean Architecture module boundaries, Hono, PostgreSQL, Drizzle ORM, TanStack Query, React Hook Form + Zod, UUID/timestamp/soft-delete row convention, `media` as a first-class shared entity, feed fan-out approach left as an explicitly open decision (not silently deferred).

**Status at v1.1: FROZEN.** Superseded by v1.2 below.

---

## 9. Final Amendments & Freeze (v1.2)

Four targeted refinements were added before implementation, none of which alter the v1.1 decisions — they fill gaps in *how modules communicate* and *why the product exists*, both of which were previously implicit.

| Addition | What it is | Why it was missing before |
|---|---|---|
| `docs/VISION.md` | Product constitution — why Bridge exists, MVP scope, explicit non-goals, differentiation vs. competitors, success metrics | Architecture was being frozen without a documented product rationale to validate module decisions against |
| Core Platform Services | Identity, Media, Activity, Notification, Search, Permission (+ future Recommendation) formalized as infrastructure distinct from feature modules, each with a defined interface | Previously, cross-cutting concerns (auth checks, media handling, event recording) were implied to live "somewhere in `core/`" without a defined contract — this made module boundaries fuzzier than the Clean Architecture goal requires |
| Cross-module event flow | Modules communicate via `ActivityService.recordEvent()` + subscribers, never by calling each other's services directly | The polymorphic-relations pattern (v1) solved *data* reuse across modules but never defined how modules *communicate behaviorally* (e.g., a listing creation triggering search indexing and notifications) — this was a real gap, not a stylistic one |
| `docs/adr/` | Nine ADRs recording every major decision made across v1–v1.2 with context, alternatives, and tradeoffs | Decisions were justified in prose inline but not in a durable, individually-referenceable record — future contributors had no single place to see *why* Hono over Express, polymorphic relations over per-type tables, etc. |

**Documentation set finalized:**
```
docs/
  VISION.md
  architecture.md      (this document)
  core-services.md
  database.md
  api.md
  decisions.md         (ADR index)
  deployment.md
  roadmap.md
  contributing.md
  testing.md
  adr/
    001-use-hono.md
    002-use-drizzle.md
    003-use-better-auth.md
    004-use-polymorphic-relations.md
    005-use-redis.md
    006-use-bullmq.md
    007-use-hono-rpc-over-rest.md
    008-defer-future-module-migrations.md
    009-core-services-as-internal-modules.md
```

**Contradiction check performed:**
- Core Platform Services introduce an event mechanism (Activity Service) — checked against the v1.1 "don't over-engineer Phase 1" principle: resolved by specifying the MVP implementation is a durable Postgres write + in-process subscribers, *not* a message broker. No new infrastructure requirement, no contradiction.
- Documenting Recommendation Service now — checked against the v1.1 rule "design ahead, migrate/build on demand for future modules": consistent, since no table or implementation is created for it, only an interface contract, matching how future-module tables (companies, jobs, etc.) were already handled.
- Activity Service requires a new table (`activity_log`) starting Phase 3 — checked against "future tables not migrated until needed": consistent, since `activity_log` is needed at Phase 3 (social posts), not deferred, and is added to the schema now rather than retroactively.
- Permission Service centralizing authorization — checked against the lightweight-DI decision (constructor-injected repositories, no DI framework): consistent, Permission Service is called the same way any other service is, no framework introduced.
- VISION.md's "depth over breadth per module" principle — checked against MVP scope (Marketplace + Social only): consistent, this is exactly why MVP is two modules done well rather than eight modules done shallowly.

No contradictions found requiring a design change.

**Status: FROZEN v1.2.** This is the final architecture review before implementation. No further architectural improvements will be suggested or made unless they fix a genuine blocker or defect discovered during implementation — in which case the fix gets its own ADR, not a silent change. Phase 1 implementation begins from this document.
