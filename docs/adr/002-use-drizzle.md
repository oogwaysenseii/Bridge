# 002 — Use Drizzle ORM instead of Prisma

## Context
Type-safe database access layer for PostgreSQL.

## Decision
Use Drizzle ORM.

## Alternatives Considered
- **Prisma** — more mature migration tooling, better introspection/studio UX, larger community.
- **Raw SQL + a query builder (Kysely)** — maximum control, minimum abstraction, more boilerplate.

## Tradeoffs
- Drizzle's migration tooling is less mature than Prisma's; some workflows require more manual SQL.
- Fewer ecosystem examples/integrations than Prisma.
- In exchange: schema-as-TypeScript-code (no separate schema DSL to learn), a lighter runtime with no generated client step blocking builds, and easier escape hatches to raw SQL for complex queries.

## Consequences
Complex migrations may require hand-written SQL rather than Prisma's more automated diffing. Team should budget for this explicitly rather than assuming Prisma-equivalent migration ergonomics.
