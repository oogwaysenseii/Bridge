// Full MVP schema (Phase 1–7 tables). Future-module tables (companies,
// jobs, courses, events, groups, dating, and — as of the v1.2 review's
// corrected classification — reviews) are documented in docs/architecture.md
// §4 but intentionally NOT exported here. See ADR-008.
export * from "./identity.schema";
export * from "./media.schema";
export * from "./social.schema";
export * from "./marketplace.schema";
export * from "./messaging.schema";
export * from "./notifications.schema";
export * from "./activity.schema";
