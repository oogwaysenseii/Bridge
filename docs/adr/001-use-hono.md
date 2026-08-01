# 001 — Use Hono instead of Express

## Context
Backend framework choice for the Bridge API. Express is the incumbent default; Hono is a newer, lighter alternative.

## Decision
Use Hono.

## Alternatives Considered
- **Express** — largest ecosystem, most middleware available, most familiar to most engineers.
- **Fastify** — good performance, mature plugin ecosystem, but heavier conceptual model (plugins/encapsulation) than needed here.

## Tradeoffs
- Hono's middleware ecosystem is smaller than Express's — some integrations may need to be hand-rolled.
- Hono is newer, so fewer battle-tested large-scale references exist.
- In exchange: first-class TypeScript support, a much lighter runtime, and — critically — a built-in RPC mode that gives typed client↔server calls without a separate tRPC dependency (see ADR-007), which directly serves the project's "no duplicated code" principle.

## Consequences
Any future contributor unfamiliar with Hono has a smaller learning curve than a full framework, but should expect to write a few things (e.g., certain middleware) that would be a one-line install in Express.
