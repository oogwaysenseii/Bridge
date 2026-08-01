# Bridge — Testing Strategy

## Tooling
- **Vitest** — unit and service-layer tests (business logic in `services/`, isolated from the HTTP layer)
- **Playwright** — end-to-end tests against real user flows (auth, posting, listing creation, messaging)

Both are configured in Phase 1 scaffolding, even though most test *content* is written alongside the phase that introduces the relevant feature.

## What gets tested per layer
- **Repositories:** thin by design (Drizzle queries only) — tested indirectly via service tests against a test database, not mocked in isolation unless a query is complex enough to warrant it.
- **Services:** the primary unit-test target — business logic, validation edge cases, permission checks, polymorphic-relation handling.
- **Core Platform Services:** tested independently of any feature module — e.g., Activity Service's `recordEvent`/`subscribe` mechanism is tested with fake event types, not through a real marketplace listing.
- **API routes:** integration-tested — request in, response out, including auth/permission rejection paths.
- **UI:** critical user flows only via Playwright (signup, login, create post, create listing, send message) — not exhaustive component-level UI testing at MVP stage.

## Phase completion requirement
Per `contributing.md`, a phase is not reviewed as complete until:
1. Services introduced in that phase have unit tests covering the main success path and at least the permission-denied / not-found failure paths.
2. Any new API route has an integration test.
3. Any new critical user-facing flow has (or extends) a Playwright test.

## Specific cases requiring test coverage by design
- **Polymorphic relation integrity:** the Phase 6+ integrity-sweep job (see `database.md`) needs a test that seeds an orphaned reference and confirms detection.
- **Permission Service:** every `can()`/`requirePermission()` policy needs both an allow and a deny test case — this is the platform's central authorization point, so gaps here are high-severity.
- **Purge job (GDPR):** needs a test verifying PII is scrubbed but referential integrity for other users' data (e.g., their view of a conversation) is preserved.
