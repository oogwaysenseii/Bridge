import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../config/env.js";
import * as schema from "./schema/index.js";

/**
 * A pooled `pg.Pool` rather than a single client — required so concurrent
 * requests don't serialize on one connection. See docs/database.md
 * "Connection management": a pooler (PgBouncer or the hosting provider's
 * managed equivalent) sits in front of this in production once concurrent
 * app instances would otherwise exhaust Postgres's own connection limit —
 * that's an infrastructure concern layered on top of this pool, not a
 * replacement for it.
 */
const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(pool, { schema });
export type Database = typeof db;
