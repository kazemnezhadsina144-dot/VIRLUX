import { test, expect } from "@playwright/test";
import { asideNav, loginAsDemo, goToPage } from "./helpers";

test.describe("dashboard login", () => {
  test.use({ baseURL: process.env.PLAYWRIGHT_APP_URL ?? "http://localhost:3001" });

  test.describe("unauthenticated", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("login page renders", async ({ page }) => {
      await page.goto("/");
      await expect(page.locator("form").getByRole("button", { name: "Sign in" })).toBeVisible();
    });

    test("demo login reaches dashboard with httpOnly cookies", async ({ page }) => {
      test.skip(!process.env.E2E_DEMO_LOGIN, "Set E2E_DEMO_LOGIN=1 with local seed");

      await loginAsDemo(page);

      const cookies = await page.evaluate(() => document.cookie);
      expect(cookies).not.toMatch(/accessToken|refreshToken/i);
    });
  });

  test("dashboard navigation and key pages", async ({ page }) => {
    test.skip(!process.env.E2E_DEMO_LOGIN, "Set E2E_DEMO_LOGIN=1 with local seed");

    await goToPage(page, "/dashboard", /Overview/i);
    const nav = asideNav(page);
    await expect(nav.getByRole("link", { name: /Overview/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /Payments/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: /Verification/i })).toBeVisible();

    await goToPage(page, "/dashboard/send", /Send payment/i);
    await expect(page.getByRole("button", { name: "Confirm rate" })).toBeVisible();

    await goToPage(page, "/dashboard/deposits", /Add funds/i);
    await goToPage(page, "/dashboard/transactions", /Payments/i);
    await goToPage(page, "/dashboard/settings", /Settings/i);
  });
});
