# 005 — Add Redis from Phase 1

## Context
The initial architecture draft deferred caching as a "later" concern. The v1.1 adversarial review identified this as a real gap: sessions, feed reads, notification counts, and chat presence/typing all need low-latency shared state that Postgres alone doesn't serve well, and retrofitting a cache layer into every read path after modules are built is significantly more expensive than including it from the start.

## Decision
Add Redis to the Phase 1 infrastructure scope, not deferred to a later phase.

## Alternatives Considered
- **No cache at MVP, add later** — simpler initial infra, but every module built without cache-awareness would need retrofitting, and session storage in particular is awkward to migrate later without a user-facing disruption (forced re-logins).
- **In-memory (per-instance) caching** — no extra infrastructure, but breaks immediately once the app runs on more than one instance, which is expected well before "millions of users" but likely before MVP is even done growing.

## Tradeoffs
- One more piece of infrastructure to run and monitor from day one.
- In exchange: sessions, the Identity Service's profile-summary cache, and BullMQ's queue backend (see ADR-006) all share this one piece of infrastructure rather than needing separate solutions.

## Consequences
Redis becomes a hard dependency for local development (Docker Compose) starting Phase 1, not an optional add-on.
