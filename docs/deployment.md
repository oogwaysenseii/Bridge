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
- **Transactional email:** implemented via Resend (see `apps/api/src/core/email/resend-email.provider.ts`). Requires `RESEND_API_KEY` and `EMAIL_FROM` (an address on a domain verified in the Resend dashboard) — both enforced at startup by `env.ts` whenever `EMAIL_PROVIDER=resend`. Postmark and SES remain reserved `EMAIL_PROVIDER` values with no implementation, only added if Resend is ever replaced.

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
2. ~~Transactional email provider~~ — resolved: Resend (see above)
3. Object storage provider (S3 / Cloudflare R2 / other)

Object storage and the hosting provider still block full production readiness; email no longer does.
