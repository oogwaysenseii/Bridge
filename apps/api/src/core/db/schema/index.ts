// Full MVP schema (Phase 1–7 tables). Future-module tables (companies,
// jobs, courses, events, groups, dating, and — as of the v1.2 review's
// corrected classification — reviews) are documented in docs/architecture.md
// §4 but intentionally NOT exported here. See ADR-008.
export * from "./identity.schema.js";
export * from "./media.schema.js";
export * from "./social.schema.js";
export * from "./marketplace.schema.js";
export * from "./messaging.schema.js";
export * from "./notifications.schema.js";
export * from "./activity.schema.js";
