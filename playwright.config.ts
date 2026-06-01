import { defineConfig, devices } from "@playwright/test";

const APP = process.env.PLAYWRIGHT_APP_URL ?? "http://localhost:3001";
const WEB = process.env.PLAYWRIGHT_WEB_URL ?? "http://localhost:3100";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "marketing",
      testMatch: /marketing\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: WEB },
    },
    {
      name: "marketing-mobile",
      testMatch: /marketing-mobile-nav\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: WEB },
    },
    {
      name: "dashboard",
      testMatch: /dashboard\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: APP },
    },
    {
      name: "send-flow",
      testMatch: /send-flow\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: APP },
    },
    {
      name: "approval-flow",
      testMatch: /approval-flow\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: APP },
    },
    {
      name: "capture-screenshots",
      testMatch: /capture-screenshots\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: APP },
    },
  ],
});
