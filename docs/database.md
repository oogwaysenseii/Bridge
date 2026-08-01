# Bridge — Database Documentation

PostgreSQL, accessed via Drizzle ORM. See [`architecture.md`](./architecture.md) §4 for the full schema listing (identity, media, social, marketplace, messaging, notifications, reviews, future-module tables). This document covers the **conventions and operational rules** that apply across the whole schema.

## Row conventions (every table)
- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `created_at TIMESTAMPTZ DEFAULT now()`
- `updated_at TIMESTAMPTZ` (updated via trigger or ORM hook, not manually per-query)
- `deleted_at TIMESTAMPTZ NULLABLE` — soft delete, except `activity_log` (append-only, never deleted)

## Soft delete is a hard rule, not a convention
Entities referenced by a polymorphic relation (`likes`, `favorites`, `reviews` — see below) are **never hard-deleted**. Hard-deleting a row that a polymorphic reference points at silently orphans data with no FK to catch it. If content must actually disappear from the database (GDPR erasure — see below), it goes through the purge job, not a direct `DELETE`.

## Polymorphic relations
`likes`, `favorites`, and `reviews` use a `{type, id}` pair instead of per-entity join tables (`post_likes`, `listing_likes`, etc.). This avoids table explosion as more likeable/favoritable/reviewable entities are added (jobs, courses, companies — future), at the cost of DB-level referential integrity, which is enforced at the application/service layer instead. See ADR-004.

**Mitigations required by this tradeoff:**
1. Soft-delete-only rule above.
2. A periodic integrity-sweep job (Phase 6+) that finds and reports orphaned polymorphic rows pointing at hard-deleted-in-error or corrupted data, as a safety net rather than a primary integrity mechanism.

## GDPR / right-to-erasure
Soft delete alone does not satisfy erasure requirements — the data is still physically present. Companion process:
- **Hard-purge job**, runs N days (default 30) after `deleted_at` is set on a `users` row.
- Purges PII (email, phone, name, bio, avatar) from the user row and dependent rows.
- Does **not** delete rows other entities have polymorphic/FK references to — those are anonymized in place (e.g., a message from a purged user renders as "Deleted user") so referential integrity and conversation history for other participants aren't broken.
- This job is a Phase 1 design requirement even though it isn't user-facing until compliance requires it — retrofitting purge logic after real user data exists is far riskier than building it in from the start.

## Activity log
`activity_log` (backs the Activity Service, see `core-services.md`) is append-only and indexed on `(subject_type, subject_id)` and `(event_type, created_at)`. It is expected to be the fastest-growing table after `messages` — partitioning by time range is the documented scaling path once volume warrants it (not needed at MVP scale).

## Messages table growth
No partitioning at MVP. Documented plan for when it's needed: partition `messages` by `conversation_id` hash or by time range, decided based on actual query patterns once real usage data exists — premature partitioning without that data risks optimizing for the wrong access pattern.

## Indexing baseline
Every foreign key gets an index. Every column used in a `WHERE` clause on a hot path (feed queries, conversation lookups, listing search filters) gets an index verified against `EXPLAIN ANALYZE` during that phase's review — not assumed correct from schema design alone.

## Connection management
Standard Postgres connection limits apply; a pooler (PgBouncer, or the hosting provider's managed equivalent) is required once concurrent connections from serverless/edge function instances would otherwise exhaust the database's connection limit. Decision on pooler specifics is tied to the deployment target (see `deployment.md`).
