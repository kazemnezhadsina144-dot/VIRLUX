import { test } from "@playwright/test";
import path from "node:path";

const OUT = path.join(__dirname, "..", "apps", "web", "public", "screenshots");

test.describe("capture product screenshots", () => {
  test.use({ baseURL: process.env.PLAYWRIGHT_APP_URL ?? "http://localhost:3001" });

  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.E2E_DEMO_LOGIN, "Set E2E_DEMO_LOGIN=1 with seeded demo account");
    await page.goto("/");
    await page.getByLabel(/email/i).fill("demo@virlux.com");
    await page.getByLabel(/password/i).fill("demo12345");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.waitForURL(/dashboard/, { timeout: 15000 });
  });

  test("overview", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(OUT, "overview.png"), fullPage: false });
  });

  test("send", async ({ page }) => {
    await page.goto("/dashboard/send");
    await page.locator('input[type="number"]').first().fill("500");
    await page.getByRole("button", { name: "Confirm rate" }).click();
    await page.getByText(/Recipient receives/i).waitFor({ timeout: 10000 });
    await page.screenshot({ path: path.join(OUT, "send.png"), fullPage: false });
  });

  test("payments", async ({ page }) => {
    await page.goto("/dashboard/transactions");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(OUT, "payments.png"), fullPage: false });
  });
});
