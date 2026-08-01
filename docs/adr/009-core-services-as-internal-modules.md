# 009 — Core Platform Services are internal modules at MVP, not separate deployed services

## Context
Introducing Identity, Media, Activity, Notification, Search, Permission, and (future) Recommendation as formal "Core Platform Services" raised the question of whether these should be separately deployed services (a lightweight microservices split) or internal modules within the same deployable backend.

## Decision
At MVP and for the foreseeable roadmap, all Core Platform Services are internal TypeScript modules under `src/core/services/`, called via normal function calls within the same process — not separately deployed services communicating over a network.

## Alternatives Considered
- **Separate microservices from the start** — would match the "think three years ahead" principle superficially, but introduces network calls, service discovery, and independent deployment/versioning overhead for a system with no current scale justification for it. This is the kind of premature complexity the v1.1 review explicitly pushed back on elsewhere (e.g., rejecting a full message broker for the Activity Service at MVP).
- **No formal service boundary at all, cross-module calls wherever convenient** — this was closer to the implicit original design, and is exactly what made module boundaries fuzzy enough to warrant this whole amendment.

## Tradeoffs
- All Core Platform Services currently share fate with the main application's deployment (scale, restart, incident blast radius) — extracting one later (most likely Identity, given it's the first candidate named in `core-services.md`) is future work, not free.
- In exchange: zero network overhead, zero distributed-systems complexity, and a migration path that's a deployment change rather than a rewrite, because every service is already called only through its defined interface, never through direct access to another service's internals.

## Consequences
Each Core Platform Service's public interface (documented in `core-services.md`) is treated as if it were a network boundary even though it isn't one yet — no service reaches into another's repository or database tables directly. This discipline is what makes future extraction into a real separate service a non-event for callers.
