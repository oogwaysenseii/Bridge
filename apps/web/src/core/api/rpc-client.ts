import { hc } from "hono/client";
import type { AppType } from "@bridge/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/**
 * The entire point of ADR-007: `AppType` is imported directly from the API
 * app (a type-only import — no server code is bundled into the client).
 * Every route added to apps/api/src/index.ts's coreRouter (and, from
 * Phase 3 on, feature-module routers mounted alongside it) is immediately
 * available here with full request/response type inference. No client-side
 * type ever needs to be hand-written or kept in sync manually.
 *
 * IMPORTANT: this must stay `import type`, never a value import. Because
 * tsconfig.base.json sets `verbatimModuleSyntax: true`, a type-only import
 * is fully erased at compile time — apps/api/src/index.ts (which calls
 * `serve()` at module scope) never actually executes in the browser
 * bundle. Changing this to a value import would pull the Node HTTP server
 * into client code.
 */
export const apiClient = hc<AppType>(API_URL, {
  init: {
    credentials: "include",
  },
});
