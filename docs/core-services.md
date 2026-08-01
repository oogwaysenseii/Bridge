# Core Platform Services

Core Platform Services are **infrastructure**, not feature modules. A feature module (marketplace, feed, chat) owns a user-facing capability. A core service owns a cross-cutting capability every module depends on. The distinction matters for the folder structure: core services live under `src/core/services/`, not `src/modules/`, and no core service depends on a feature module — dependencies only flow one direction, modules → core services, never the reverse.

At MVP scale, every core service is an **internal TypeScript module with a clean interface**, not a separately deployed microservice. The interfaces are designed so any of them *could* be extracted into its own deployable service later without changing how callers use it — but nothing is over-built for a scale Bridge doesn't have yet (see ADR-009).

---

## 1. Identity Service

**Responsibilities:** canonical resolution of "who is this" — authentication state, session validation, and a lightweight profile projection other services can use without joining into `users`/`profiles` themselves.

**Public interface:**
- `getCurrentSession(request)` — validate a session/token, return the authenticated user or null
- `getUserById(userId)` — canonical user record
- `getProfileSummary(userId)` — cached lightweight projection (`{id, displayName, username, avatarMediaId}`) used by every other module to avoid N+1 profile joins
- `resolveIdentity(token)` — used by Better Auth adapter glue

**Dependencies:** PostgreSQL (`users`, `profiles`), Redis (session + profile-summary cache), Better Auth.

**Future scalability:** first candidate for extraction into its own service if Bridge ever needs auth to be independently scaled/deployed. Because every other service consumes it only through the interface above, that extraction is a deployment change, not a rewrite of every caller.

**Consumed by:** every module, without exception.

---

## 2. Media Service

**Responsibilities:** upload validation (type/size), storage adapter abstraction (so the storage provider can change without touching callers), variant generation (via the job queue, not synchronously in the request), moderation hook, and CDN URL resolution.

**Public interface:**
- `uploadMedia(file, ownerId)` — validates, stores original, enqueues variant generation, returns a `media_id` immediately
- `getMediaVariants(mediaId)` — returns `{thumb, small, medium, large}` URLs
- `deleteMedia(mediaId)` — soft delete only (see database.md polymorphic-reference rule)
- `attachModerationResult(mediaId, result)` — called by the moderation worker

**Dependencies:** object storage (provider TBD, see `deployment.md`), BullMQ (variant generation, moderation queueing).

**Consumed by:** `users` (avatars/covers), `feed` (post media), `marketplace` (listing images), `chat` (message attachments), and every future module with user-uploaded media (companies, courses, events).

---

## 3. Activity Service

**Responsibilities:** the platform's event backbone. Every meaningful domain action (post created, listing created, follow, review left, job posted — future) is recorded as an **append-only activity event**. Other services subscribe to relevant event types instead of the producing module calling them directly. This is what keeps modules decoupled (see §7, Cross-Module Event Flow).

**Public interface:**
- `recordEvent({type, actorId, subjectType, subjectId, metadata})` — append an event
- `subscribe(eventType, handler)` — internal registration, used by Search/Notification/Recommendation services at startup
- `getActivityForSubject(subjectType, subjectId)` — e.g., "history of this listing"

**Dependencies:** PostgreSQL (`activity_log`, append-only, see `database.md`).

**MVP implementation note:** this is an **in-process event emitter backed by a durable `activity_log` write**, not a distributed message broker. The event is written to Postgres synchronously (so it's never lost), then in-process subscribers react (which may themselves enqueue async work via BullMQ). Upgrading to a real broker (Redis Streams / NATS / Kafka) is a documented future step behind the same `subscribe`/`recordEvent` interface — not a Phase 1 requirement. This keeps the decoupling benefit now without building distributed infrastructure Bridge doesn't need yet.

**Consumed by:** Search Service, Notification Service, Recommendation Service (future), and any future Analytics service.

---

## 4. Notification Service

**Responsibilities:** subscribes to relevant Activity Service events, applies user preferences/mute rules, and fans out to delivery channels.

**Public interface:**
- `notify(recipientId, type, payload)` — create + deliver a notification
- `markRead(notificationId)` / `markAllRead(userId)`
- `getUnreadCount(userId)`

**Dependencies:** Activity Service (event source), BullMQ (fan-out + delivery jobs), Identity Service (profile summaries for notification content), future push/email adapters.

**Consumed by:** feed (likes/comments), marketplace (favorites, messages on your listing), chat (new message), follows — and every future module that needs to alert a user.

---

## 5. Search Service

**Responsibilities:** index searchable entities as they're created/updated (via Activity Service subscription) and serve query/filter/rank requests behind a stable interface, independent of the underlying search engine.

**Public interface:**
- `indexEntity(type, id, payload)`
- `removeFromIndex(type, id)`
- `search(query, {types, filters, pagination})`

**Dependencies (MVP):** PostgreSQL full-text search (`tsvector`) — no extra infrastructure needed at MVP scale.

**Future scalability:** documented upgrade path to a dedicated engine (Meilisearch/Typesense) when query complexity or index size outgrows Postgres FTS — swapped behind the same interface, callers unaffected.

**Consumed by:** `search` module (Phase 7), and eventually any module with a "browse/search X" UI (jobs, companies, courses — future).

---

## 6. Permission Service

**Responsibilities:** centralizes authorization decisions instead of scattering ad hoc `if (userId === ownerId)` checks across every module's service layer. Handles ownership checks, role-based checks (company/group member roles — future), and visibility rules (profile privacy, post visibility).

**Public interface:**
- `can(userId, action, resource)` — returns boolean
- `requirePermission(userId, action, resource)` — throws `AppError('forbidden')` if denied

**Dependencies:** Identity Service (who the actor is); it does **not** own resource data — it's a policy layer that modules call with their own resource records, so ownership data stays where it belongs.

**Consumed by:** every module's service layer, on every write and every privacy-sensitive read.

---

## 7. Recommendation Service *(future — documented, not built at MVP)*

**Responsibilities (future):** consume Activity Service behavioral signals plus the Search index to generate "you might like" surfaces across listings, posts, and eventually jobs/courses/events/dating.

**Public interface (future):** `getRecommendations(userId, context)`

**Dependencies (future):** Activity Service, Search Service, likely a dedicated feature store at real scale.

**Consumed by (future):** feed ranking, marketplace, and effectively every module — one shared recommendation substrate instead of each module inventing its own "related items" logic.

**Status:** documented now, per the "design ahead, build on demand" principle (v1.1 freeze) — not implemented until a module actually needs it, expected post-MVP.

---

## 8. Cross-Module Event Flow

Modules **never call each other's services directly**. They record what happened through the Activity Service, and interested core services subscribe to those events. This is the decoupling mechanism that lets future modules (companies, jobs, events, groups, dating, reviews) plug in without touching existing module code.

**Example — Marketplace listing created:**
```
Marketplace module: listing created
  → Activity Service: recordEvent('listing.created', ...)
      → Search Service (subscriber): indexEntity('listing', id, payload)
      → Notification Service (subscriber): notify followers of the seller
      → Recommendation Service (future subscriber): candidate signal recorded
```

**Example — Social post created:**
```
Feed module: post created
  → Activity Service: recordEvent('post.created', ...)
      → Search Service: indexEntity('post', id, payload)
      → Notification Service: notify followers
      → (future) Analytics: engagement pipeline
```

**Example — Company publishes a job (future module):**
```
Jobs module: job created
  → Activity Service: recordEvent('job.created', ...)
      → Notification Service: notify company followers
      → Search Service: indexEntity('job', id, payload)
      → Activity Service itself already recorded the event — no further action needed for "activity recorded"
```

**Rule:** a module's service layer calls `ActivityService.recordEvent(...)` after a successful write, and that's the *only* cross-module touchpoint on the producing side. Everything downstream is a subscriber, not a direct dependency. If a future module needs something a core service doesn't yet provide, the core service's interface is extended — the producing module is never modified to know about the new consumer.
