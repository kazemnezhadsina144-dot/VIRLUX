import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const APP = process.env.PLAYWRIGHT_APP_URL ?? "http://localhost:3001";
const WEB = process.env.PLAYWRIGHT_WEB_URL ?? "http://localhost:3100";
const isLiveTarget = [APP, WEB].some((u) => /vercel\.app|virlux\.com/.test(u));
const AUTH_FILE = path.join(__dirname, "e2e", ".auth", "demo-user.json");
const demoLogin = process.env.E2E_DEMO_LOGIN === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: isLiveTarget ? 2 : process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: APP },
    },
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
      dependencies: demoLogin ? ["setup"] : [],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: APP,
        storageState: demoLogin ? AUTH_FILE : undefined,
      },
    },
    {
      name: "send-flow",
      testMatch: /send-flow\.spec\.ts/,
      dependencies: demoLogin ? ["setup"] : [],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: APP,
        storageState: demoLogin ? AUTH_FILE : undefined,
      },
    },
    {
      name: "approval-flow",
      testMatch: /approval-flow\.spec\.ts/,
      dependencies: demoLogin ? ["setup"] : [],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: APP,
        storageState: demoLogin ? AUTH_FILE : undefined,
      },
    },
    {
      name: "capture-screenshots",
      testMatch: /capture-screenshots\.spec\.ts/,
      dependencies: demoLogin ? ["setup"] : [],
      use: {
        ...devices["Desktop Chrome"],
        baseURL: APP,
        storageState: demoLogin ? AUTH_FILE : undefined,
      },
    },
  ],
});
