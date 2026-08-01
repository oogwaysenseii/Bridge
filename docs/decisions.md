# Architecture Decision Records — Index

Full records live in [`adr/`](./adr/). This is a log, not a duplicate of their content.

| # | Decision | Status |
|---|---|---|
| [001](./adr/001-use-hono.md) | Use Hono instead of Express | Accepted |
| [002](./adr/002-use-drizzle.md) | Use Drizzle ORM instead of Prisma | Accepted |
| [003](./adr/003-use-better-auth.md) | Use Better Auth instead of Firebase Auth / Clerk | Accepted |
| [004](./adr/004-use-polymorphic-relations.md) | Use polymorphic `{type, id}` relations for likes/favorites/reviews | Accepted |
| [005](./adr/005-use-redis.md) | Add Redis from Phase 1 (cache, queue backend) | Accepted |
| [006](./adr/006-use-bullmq.md) | Add BullMQ for background job processing | Accepted |
| [007](./adr/007-use-hono-rpc-over-rest.md) | Use Hono RPC for internal client↔server calls instead of plain REST | Accepted |
| [008](./adr/008-defer-future-module-migrations.md) | Document future-module schema now, migrate only when the module is built | Accepted |
| [009](./adr/009-core-services-as-internal-modules.md) | Core Platform Services are internal modules at MVP, not separate deployed services | Accepted |

New decisions that change a previously frozen choice, or introduce a new infrastructure dependency, get a new ADR — see `contributing.md`. Existing ADRs are not edited after acceptance; a reversal gets a new ADR that supersedes the old one.
