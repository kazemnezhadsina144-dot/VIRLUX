import { test, expect } from "@playwright/test";

test.describe("dashboard login", () => {
  test.use({ baseURL: process.env.PLAYWRIGHT_APP_URL ?? "http://localhost:3001" });

  test("login page renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Sign in", exact: true })).toBeVisible();
  });

  test("demo login reaches dashboard with httpOnly cookies", async ({ page }) => {
    test.skip(!process.env.E2E_DEMO_LOGIN, "Set E2E_DEMO_LOGIN=1 with local seed");

    await page.goto("/");
    await page.getByLabel(/email/i).fill("demo@virlux.com");
    await page.getByLabel(/password/i).fill("demo12345");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

    const cookies = await page.evaluate(() => document.cookie);
    expect(cookies).not.toMatch(/accessToken|refreshToken/i);
  });

  test("dashboard navigation and key pages", async ({ page }) => {
    test.skip(!process.env.E2E_DEMO_LOGIN, "Set E2E_DEMO_LOGIN=1 with local seed");

    await page.goto("/");
    await page.getByLabel(/email/i).fill("demo@virlux.com");
    await page.getByLabel(/password/i).fill("demo12345");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });

    await expect(page.getByRole("link", { name: "Overview" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Payments" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Verification" })).toBeVisible();

    await page.getByRole("link", { name: "Send", exact: true }).click();
    await expect(page.getByRole("heading", { name: /Send payment/i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Confirm rate" })).toBeVisible();

    await page.getByRole("link", { name: "Deposits" }).click();
    await expect(page.getByRole("heading", { name: /Add funds/i })).toBeVisible();

    await page.getByRole("link", { name: "Payments" }).click();
    await expect(page.getByRole("heading", { name: /Payments/i })).toBeVisible();

    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page.getByRole("heading", { name: /Settings/i })).toBeVisible();
  });
});
