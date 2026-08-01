import { defineConfig, devices } from "@playwright/test";

const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;
const CI_RETRY_COUNT = 2;

/**
 * Per docs/testing.md: Playwright covers critical user-facing flows only
 * at MVP stage (signup, login, create post, create listing, send message —
 * added phase by phase as each exists), not exhaustive UI coverage.
 * Phase 1 has exactly one such flow worth smoke-testing end to end: the
 * app shell rendering and navigating between the public pages.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? CI_RETRY_COUNT : 0,
  reporter: "html",
  use: {
    baseURL: DEV_SERVER_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: DEV_SERVER_URL,
    reuseExistingServer: !process.env.CI,
  },
});
