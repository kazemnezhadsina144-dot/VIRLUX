import { test as setup } from "@playwright/test";
import { loginAsDemo } from "./helpers";
import fs from "node:fs";
import path from "node:path";

const AUTH_DIR = path.join(__dirname, ".auth");
const AUTH_FILE = path.join(AUTH_DIR, "demo-user.json");

setup("authenticate demo user", async ({ page }) => {
  setup.skip(!process.env.E2E_DEMO_LOGIN, "Set E2E_DEMO_LOGIN=1");
  setup.setTimeout(90_000);

  await loginAsDemo(page);
  fs.mkdirSync(AUTH_DIR, { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
});

export { AUTH_FILE };
