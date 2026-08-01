# 006 — Add BullMQ for background job processing

## Context
Several operations must not block the request/response cycle: image variant generation, notification fan-out, transactional email sending, and (later) content moderation and the GDPR purge job. The initial draft handled image processing synchronously on upload, flagged even then as not scaling past a small user base, but without naming a fix.

## Decision
Add BullMQ (Redis-backed job queue) to the Phase 1 infrastructure scope.

## Alternatives Considered
- **Synchronous processing** — simplest, but blocks requests on slow operations (image resizing, email sending) and was already identified as a scalability problem in the original design.
- **A managed queue service (e.g., a cloud provider's native queue)** — avoids self-hosting queue infrastructure, but adds a vendor dependency before the deployment target is even chosen (see `deployment.md`), and duplicates infrastructure Redis (already required, ADR-005) can serve.
- **A heavier message broker (RabbitMQ, Kafka)** — appropriate at real scale, not justified at MVP volume; would be premature infrastructure for the current stage.

## Tradeoffs
- Requires a persistent worker process, which constrains the deployment target (rules out pure edge-function-only hosting for the worker component — documented in `deployment.md`).
- One more moving part in local development and production operations.

## Consequences
Media Service's variant generation, Notification Service's fan-out, and the future moderation and GDPR-purge jobs are all built against this queue from the start rather than as synchronous code that gets refactored later.
