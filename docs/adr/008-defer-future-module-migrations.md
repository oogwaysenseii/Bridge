# 008 — Document future-module schema now, migrate only when the module is built

## Context
The original brief required designing database relationships for future modules (companies, jobs, courses, events, groups, dating, reviews) even though only Marketplace + Social ship at MVP. The initial draft implied these tables would be migrated into the real database now, alongside MVP tables.

## Decision
Future-module schemas are fully documented (see `architecture.md` §4) but **not migrated** into the actual database until the module that owns them is actually being built.

## Alternatives Considered
- **Migrate all future tables now** — the original implicit approach; guarantees the schema exists when needed, but commits to a specific shape for tables nobody uses yet. Any refinement discovered while actually designing the Jobs module later becomes a breaking migration against a live (if empty) table, with all the migration-safety overhead that implies, for zero present benefit.
- **Don't design future schema at all, decide later** — contradicts the project's explicit requirement to design ahead for future modules and the "never design temporary solutions" principle.

## Tradeoffs
- Documentation and actual database schema can, in principle, drift if the document isn't kept current — mitigated by treating `architecture.md` as the single source of truth reviewed at each phase, not a one-time artifact.

## Consequences
Phase 1's migrations include only tables needed through Phase 7 (MVP scope). Each future module's Phase (post-MVP, see `roadmap.md`) includes reviewing its documented schema against whatever's been learned since, then migrating — design intent preserved, migration cost deferred to when it's actually informed by real requirements.
