import pino from "pino";
import { env } from "../config/env.js";

const PRETTY_TRANSPORT = {
  target: "pino-pretty",
  options: { colorize: true, translateTime: "HH:MM:ss" },
} as const;

/**
 * The single logger instance for the whole API. Every module imports this
 * rather than calling console.log directly — structured JSON logs in
 * production, human-readable pretty-printing in development.
 *
 * The transport option is added via conditional spread, not a ternary
 * that falls back to `undefined`. tsconfig.base.json sets
 * `exactOptionalPropertyTypes: true`, and pino's `LoggerOptions.transport`
 * is declared as an optional property (`transport?: ...`) without an
 * explicit `| undefined` in its type — that flag specifically forbids
 * assigning `undefined` to a property like that; the key must be entirely
 * absent instead. `...(condition ? { transport: X } : {})` omits the key
 * outright in production rather than setting it to `undefined`.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    env: env.NODE_ENV,
  },
  ...(env.NODE_ENV === "development" ? { transport: PRETTY_TRANSPORT } : {}),
});

export type Logger = typeof logger;
