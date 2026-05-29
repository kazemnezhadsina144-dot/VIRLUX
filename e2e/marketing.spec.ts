import { test, expect } from "@playwright/test";

test.describe("marketing site", () => {
  test.use({ baseURL: process.env.PLAYWRIGHT_WEB_URL ?? "http://localhost:3100" });

  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /VIRLUX/i }).first()).toBeVisible();
  });

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: /Pricing/i })).toBeVisible();
  });

  test("terms and privacy load", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: /Terms of Service/i })).toBeVisible();
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /Privacy Policy/i })).toBeVisible();
  });
});
