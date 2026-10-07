import { defineConfig, devices } from "@playwright/test";
import {
  APP_PORT,
  MOCK_AUTH_PORT,
  MOCK_AUTH_URL,
} from "./tests/e2e/support/env";

const reuseExistingServer = !process.env.CI;

export default defineConfig({
  testDir: "tests/e2e",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mobile",
      use: {
        ...devices["Pixel 7"],
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
        },
      },
    },
  ],
  webServer: [
    {
      command: "node tests/e2e/support/mock-supabase.mjs",
      env: { MOCK_SUPABASE_PORT: String(MOCK_AUTH_PORT) },
      url: `${MOCK_AUTH_URL}/__mock/health`,
      reuseExistingServer,
    },
    {
      command: `npm run build && npm run start -- --port ${APP_PORT}`,
      env: {
        NEXT_DIST_DIR: ".next-e2e",
        NEXT_PUBLIC_SUPABASE_URL: MOCK_AUTH_URL,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_e2e",
      },
      url: `http://localhost:${APP_PORT}`,
      reuseExistingServer,
      timeout: 300_000,
    },
  ],
});
