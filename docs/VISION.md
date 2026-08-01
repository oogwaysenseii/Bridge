# Bridge — Vision & Product Constitution

This document is the product constitution for Bridge. Every feature, module, and design decision — present and future — must trace back to something written here. If a proposed feature can't be justified against this document, it doesn't belong in Bridge.

---

## 1. Why Bridge Exists

Modern life is fragmented across identity silos. A person maintains a separate identity for buying and selling (Marketplace/Craigslist), professional life (LinkedIn), community discussion (Reddit), group coordination (Discord), events (Meetup), and dating (Tinder/Hinge) — each with its own profile, reputation, and trust graph built from zero.

None of these identities talk to each other, even though they describe the same person. The trust you've built as a reliable seller doesn't carry over to being a reliable event host. The professional credibility you've built on LinkedIn doesn't inform whether someone should trust you in a local buy/sell group.

Bridge exists to be the single identity layer underneath all of these contexts — not a replacement for depth in any one of them, but the connective layer that lets reputation, relationships, and context follow the person instead of being reset per app.

## 2. The Problem It Solves

- **Identity fragmentation.** The same person is five different unverified strangers across five different platforms.
- **Reputation that doesn't transfer.** Trust earned in one context (a good seller, a reliable event organizer, a helpful community member) is invisible everywhere else.
- **Context switching.** Coordinating a local event means bouncing between a Meetup listing, a Discord server, a Facebook group, and a group chat — for one event.
- **No single graph.** A user's professional network, social circle, and local community are actually overlapping in real life, but every platform pretends they're separate.

## 3. Target Users

- **Primary (MVP):** people active in local, identity-driven exchange — buying/selling locally, following/engaging with people they know or want to know, who are tired of maintaining a different reputation on every app.
- **Secondary (post-MVP):** small businesses and companies that want one place to sell, hire, host events, and build community around a single verified identity instead of five disconnected business pages.
- **Long-term:** anyone whose social, professional, and transactional life would benefit from one identity with portable, contextual reputation.

## 4. MVP Scope

**In scope for MVP:**
- Single user identity (auth, profile, followers/following)
- Social feed (posts, comments, likes)
- Marketplace (listings, categories, favorites, seller profiles, image uploads)
- Messaging (marketplace chat + direct messages)
- Notifications
- Search (people, listings)

**Explicitly out of scope for MVP** (designed for, not built):
- Companies, jobs, courses, events, groups, dating, reviews modules
- Recommendation engine
- Push notifications (in-app only at MVP)
- Public API / third-party integrations
- Monetization (ads, paid listings, subscriptions)
- Multi-language / i18n
- Native mobile apps (responsive web first)

Scope is deliberately narrow so the identity + reputation spine is solid before anything is layered on top of it.

## 5. Long-Term Vision

Bridge becomes the identity and reputation layer a person carries across every context of their life online: what they sell, what they say, who they know, where they work, what they attend, what they learn, and who they date — all provably the same trustworthy (or not) person, without forcing every context into one undifferentiated feed. Modules stay purpose-built for their context; identity and reputation are what's shared.

## 6. Product Principles

1. **One identity, contextual presentation.** A single account, but a marketplace seller card looks nothing like a dating profile — same trust graph underneath, different surface per context.
2. **Reputation is portable by default, not siloed per module.**
3. **No dark patterns.** No engagement-bait notifications, no fake scarcity, no manipulative retention mechanics.
4. **Privacy is a default, not a settings-page afterthought.** Visibility controls exist per profile and per module from day one.
5. **Depth over breadth per module.** Each module should be good enough to compete with the dedicated app it replaces, not a watered-down clone.
6. **Never design temporary solutions.** Every schema and service decision assumes 3+ years of evolution.

## 7. Success Metrics

MVP-stage metrics (what "working" looks like before growth metrics matter):
- **Identity depth:** % of users with a complete profile who are active in more than one module (social + marketplace) — this is the core hypothesis test for "one identity, many contexts."
- **Trust signal usage:** % of marketplace transactions where the buyer/seller viewed the other's social activity/profile before transacting.
- **Retention:** Week-4 retention of users active in 2+ modules vs. users active in only 1 — tests whether cross-module identity actually drives stickiness.
- **Marketplace liquidity:** listing-to-sale conversion rate, time-to-first-response on listings.
- **Trust & safety:** report rate, moderation response time, repeat-offender rate.

Vanity metrics (raw signups, raw DAU) are tracked but not treated as success on their own — they don't test the core hypothesis.

## 8. Non-Negotiable Engineering Principles

These override convenience, speed, and individual preference:

- Clean Architecture module boundaries are never bypassed for a shortcut.
- No business logic in UI components.
- Every schema decision is made as if it will still be in production in 3 years.
- Every module is built so it *could* be extracted into its own service later, even though it won't be at MVP scale.
- Identity, Media, and Permission concerns are never duplicated per-module — they're consumed from the core services (see `docs/architecture.md` §Core Platform Services).
- No feature ships without the phase's tests passing (see `docs/testing.md`).
- Every non-trivial architectural decision gets an ADR (see `docs/adr/`).

## 9. What Makes Bridge Fundamentally Different

| vs. | Why Bridge is different |
|---|---|
| **Facebook Marketplace** | Marketplace trust today is entirely local and unverified — a seller's identity is disconnected from any broader reputation. Bridge ties marketplace activity to the same identity a person uses socially and professionally, so reputation compounds instead of resetting per listing. |
| **LinkedIn** | LinkedIn optimizes for professional performance — curated, guarded, transactional networking. Bridge doesn't ask people to perform a "professional self"; a company/job module (future) sits on the same authentic identity as everything else, not a separate persona. |
| **Reddit** | Reddit identity is pseudonymous and disconnected from any real-world accountability or reputation outside the platform — that's a feature for Reddit, but it's exactly what Bridge doesn't want: Bridge's value is *because* identity is consistent and accountable across contexts. |
| **Discord** | Discord is excellent at real-time community coordination but has no persistent public identity, discovery, or reputation layer outside a given server. Bridge's groups/events (future) inherit a real identity and cross-community reputation Discord servers can't see into each other. |
| **Meetup** | Meetup treats each event/group as an island with no connection to who attendees are elsewhere. Bridge's events module (future) benefits from the same social graph and reputation as everything else — you can see who you already know or trust before attending. |

**Why combine these experiences:** because in real life they aren't separate — the person you buy a used bike from might also be someone in your professional network or your running group. Splitting that across five apps is the artificial part; Bridge just stops pretending they're unrelated.

**Bridge's unfair advantage:** a single, deep identity graph that gets more valuable per module added, because every new module inherits trust and context the others already built — a cold-start problem competitors solve per-vertical, Bridge only solves once.

**How one unified identity creates value across every module:** every module both contributes to and benefits from the same reputation signal. A good marketplace seller who's also socially active is more discoverable and trusted as a job candidate later; a reliable event host is a more trusted seller. Each module is a data source and a consumer of the same underlying trust graph — this is the compounding effect no single-purpose competitor can replicate without becoming Bridge.
