# 007 — Use Hono RPC for internal calls instead of plain REST

## Context
The original design specified React Hook Form + Zod on the client and Hono + Zod on the server, implying request/response types would be defined (and kept in sync) separately on each side — direct duplication of the exact kind the project's own principles say to avoid ("prefer reusable components over duplicated code").

## Decision
Internal client↔server calls use Hono's built-in RPC client, giving full type inference from the server's route definitions without a separate type-definition step.

## Alternatives Considered
- **Plain REST with manually maintained client types** — the original implicit approach; simplest mental model, but guarantees drift between client and server types over time.
- **tRPC** — would achieve the same type-safety goal, and is a very reasonable alternative, but adds a dependency that duplicates what Hono already provides natively given Hono is already the chosen backend framework.
- **GraphQL** — much heavier to set up and operate than this project's needs justify at MVP; over-engineering relative to the actual problem (internal type duplication), not a proportionate fix.

## Tradeoffs
- RPC mode ties the client tightly to the exact Hono route definitions — fine for an internal first-party client, but this is exactly why a separate plain-REST surface (see `api.md`) is kept for any future non-TypeScript consumer (public API, webhooks).

## Consequences
`api.md` defines two surfaces: internal RPC (typed, used by the Bridge web client) and external REST (documented separately, built when a non-TS consumer actually needs it — not at MVP).
