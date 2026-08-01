# Bridge — Deployment

## Status: hosting provider not yet selected
This is a genuinely open decision, pending product-owner input — not a gap in the architecture. What follows are the infrastructure **requirements** any target must satisfy, decided independent of which specific provider is chosen, so Phase 1 scaffolding isn't blocked on that choice.

## Required infrastructure components
- **Application runtime:** Node-compatible (Hono runs on Node, but also on edge runtimes — see constraint below on background workers)
- **PostgreSQL:** managed or self-hosted, with connection pooling support (PgBouncer or provider-managed equivalent) once concurrent connections warrant it
- **Redis:** for session/profile-summary caching, BullMQ's queue backend, and (later) rate limiting
- **Persistent worker process:** BullMQ workers (image variant generation, notification fan-out, moderation, purge jobs) require a **long-running Node process**, not a pure request/response edge function. This rules out edge-function-only platforms for the worker component specifically — the API layer itself can still run on the edge if the provider supports it.
- **Object storage:** S3-compatible, for original + variant media
- **CDN:** in front of object storage for media delivery
- **Transactional email:** provider not yet selected (blocks Better Auth email verification/reset — open decision, see conversation history)

## Environments
- `development` — local, Docker Compose for Postgres/Redis
- `staging` — mirrors production infrastructure at smaller scale, used for phase review before merging to main
- `production`

## What's explicitly deferred
- Multi-region deployment — not justified at MVP user counts; the architecture doesn't block it later (stateless API layer, externalized session/cache state in Redis), but it isn't built now.
- Read replicas — same reasoning; added when read load on primary actually warrants it.
- CI/CD pipeline specifics — tool not yet chosen (GitHub Actions is the default assumption given typical TS monorepo tooling, but not confirmed).

## Decision needed before Phase 1 infra provisioning
1. Hosting provider (Vercel / Fly / Railway / self-hosted / other)
2. Transactional email provider (Resend / Postmark / SES / other)
3. Object storage provider (S3 / Cloudflare R2 / other)

None of these block the Phase 1 **code** scaffolding (schema, services, routes can all be written against local Docker Compose Postgres/Redis first), but all three are required before Phase 1 can be deployed anywhere.
