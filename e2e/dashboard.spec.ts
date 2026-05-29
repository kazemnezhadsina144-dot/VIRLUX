import { test, expect } from "@playwright/test";

test.describe("dashboard login", () => {
  test.use({ baseURL: process.env.PLAYWRIGHT_APP_URL ?? "http://localhost:3001" });

  test("login page renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  });

  test("demo login reaches dashboard", async ({ page }) => {
    test.skip(!process.env.E2E_DEMO_LOGIN, "Set E2E_DEMO_LOGIN=1 with local seed");

    await page.goto("/");
    await page.getByLabel(/email/i).fill("demo@virlux.com");
    await page.getByLabel(/password/i).fill("demo12345");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  });
});
