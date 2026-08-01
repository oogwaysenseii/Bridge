# Contributing to Bridge

## Module boundary rules (non-negotiable, see `VISION.md` §8)
- A module's `ui/` never imports another module's `repositories/` or `services/` directly.
- Cross-module communication goes through Core Platform Services (`ActivityService.recordEvent` + subscribers) — never a direct call from one feature module's service into another's.
- No business logic in UI components — UI calls a service (via Hono RPC), it doesn't contain decision logic itself.
- Core Platform Services never depend on feature modules — dependency direction is one-way.

## Folder structure
Every module owns `api/`, `services/`, `repositories/`, `validation/`, `ui/`. See `architecture.md` §3.

## When to write an ADR
Any decision that:
- Chooses between two or more viable technical approaches, or
- Changes a previously frozen decision, or
- Introduces a new infrastructure dependency (a new datastore, queue, external service)

...gets an ADR in `docs/adr/`, following the existing format (Context / Decision / Alternatives / Tradeoffs / Consequences). Small implementation choices within an already-decided approach don't need one.

## Testing requirement
No phase is considered complete without its tests passing — see `testing.md`. This is enforced at phase review, not left to individual discretion.

## Commit / PR conventions
(To be finalized alongside CI/CD tooling decision in `deployment.md`.) At minimum: one logical change per PR, phase-scoped branches, no direct commits to `main`.
