import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

/**
 * React Testing Library only auto-registers its own `afterEach(cleanup)`
 * when it detects a global `afterEach` on `globalThis` — which requires
 * Vitest's `test.globals: true`. This config deliberately doesn't set
 * that (every test file explicitly imports `describe`/`it`/`expect`/etc.
 * from "vitest", consistently, rather than relying on injected globals),
 * so RTL's auto-detection silently finds nothing and never activates.
 * Without this, rendered DOM from one test accumulates into the next
 * within the same file — exactly the "TWO Save buttons" /
 * "2, then 3, then 4 copies of Set dark" symptom.
 */
afterEach(() => {
  cleanup();
});
