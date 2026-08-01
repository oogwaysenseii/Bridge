import { defineConfig } from "drizzle-kit";
import { env } from "./src/core/config/env";

// See docs/database.md for schema conventions and docs/adr/008 for why
// future-module tables (companies, jobs, courses, events, groups, dating,
// reviews) are intentionally NOT included here yet.
export default defineConfig({
  schema: "./src/core/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
