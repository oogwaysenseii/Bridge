# Bridge — Roadmap

Implementation proceeds **one phase at a time**. A phase is not started until the previous one is complete, documented, tested, and reviewed (per project rules). Nothing here is a commitment to timeline — it's sequencing.

## MVP Phases

| Phase | Status |
|---|---|
| 1 | **Dependency conflicts found and fixed — pending re-verification.** See [`dependency-audit.md`](./dependency-audit.md) for the blocker resolution and [`phase-1-report.md`](./phase-1-report.md) for the full implementation report. Not approved until `pnpm install`, `typecheck`, `lint`, `test`, and `build` all pass against a real toolchain. |
| 2–7 | Not started. |

| Phase | Scope | New Core Services scaffolded |
|---|---|---|
| 1 | Project setup, monorepo, DB connection, Better Auth, design system, routing | Identity, Permission |
| 2 | User profiles, avatar upload, followers/following, settings | Media |
| 3 | Social: posts, comments, likes, feed, infinite scroll | Activity, Notification (event recording + first notification types) |
| 4 | Marketplace: listings, categories, filters, search, favorites, seller profiles, image upload | — (consumes Media, Activity) |
| 5 | Messaging: realtime chat, marketplace chat, typing indicators, read receipts | Realtime layer decision required before this phase (see `deployment.md` / open decisions) |
| 6 | Notifications: full fan-out across likes/comments/messages/followers/marketplace activity | — (Notification Service already scaffolded, expanded) |
| 7 | Search: people, listings (companies/groups when those modules exist) | Search |

## Post-MVP (designed for, not built)
Rollout order not committed — depends on product priorities after MVP validates the core identity hypothesis (see `VISION.md` §7 success metrics):
- Companies
- Jobs
- Reviews (schema and polymorphic mechanism already support this early)
- Groups
- Events
- Courses
- Dating
- Recommendation Service (activates once enough Activity Service data exists to be useful)
- AI Assistant module

## Explicit non-goals for the roadmap above
See `VISION.md` §4 — public API, native mobile, i18n, monetization, and push notifications are not scheduled; they're acknowledged future work, not omissions.
