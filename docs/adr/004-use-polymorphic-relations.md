# 004 — Use polymorphic {type, id} relations for likes/favorites/reviews

## Context
Multiple entities (posts, comments, listings, and future companies/jobs/courses) need "liked by," "favorited by," and "reviewed by" relationships. A separate join table per entity type (`post_likes`, `listing_likes`, `comment_likes`, ...) grows linearly with every new likeable entity.

## Decision
Use a single `likes` table (and equivalently `favorites`, `reviews`) with a polymorphic `{likeable_type, likeable_id}` pair instead of per-entity join tables.

## Alternatives Considered
- **Per-entity join tables** — full DB-level referential integrity via real foreign keys, but table count grows with every new likeable/favoritable/reviewable entity, and shared logic (e.g., "get like count") has to be reimplemented or generalized awkwardly per table.
- **A generic `reactions` table with a JSON payload** — maximally flexible, but pushes even more validation into the application layer with less structure than the {type, id} approach.

## Tradeoffs
- No database-level foreign key can point at a polymorphic target — Postgres doesn't support polymorphic FKs natively. Integrity is enforced at the application/service layer instead.
- Risk: a hard-deleted row leaves orphaned polymorphic references with nothing to catch it at the DB level.

## Consequences
Two mitigations are mandatory, not optional (see `database.md`):
1. Entities referenced polymorphically are never hard-deleted, only soft-deleted.
2. A periodic integrity-sweep job checks for orphaned references as a safety net.

This tradeoff was reviewed and reaffirmed during the v1.1 adversarial review — the schema-reuse benefit across current and future modules (reviews alone will span posts, listings, companies, jobs) was judged to outweigh the integrity cost given the mitigations above.
