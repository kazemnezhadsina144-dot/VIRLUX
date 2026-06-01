import { test, expect } from "@playwright/test";
import { PUBLIC_SURFACE_FORBIDDEN } from "@virlux/shared";

function assertNoDrift(text: string, pageName: string) {
  for (const { label, pattern } of PUBLIC_SURFACE_FORBIDDEN) {
    expect(text, `${pageName} must not expose "${label}"`).not.toMatch(pattern);
  }
}

test.describe("marketing site", () => {
  test.use({ baseURL: process.env.PLAYWRIGHT_WEB_URL ?? "http://localhost:3100" });

  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /VIRLUX/i }).first()).toBeVisible();
    assertNoDrift(await page.locator("body").innerText(), "home");
  });

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByRole("heading", { name: /Pricing/i })).toBeVisible();
    assertNoDrift(await page.locator("body").innerText(), "pricing");
  });

  test("terms and privacy load", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: /Terms of Service/i })).toBeVisible();
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: /Privacy Policy/i })).toBeVisible();
  });

  test("book demo CTA resolves", async ({ page }) => {
    await page.goto("/pricing");
    const demo = page.getByRole("link", { name: /Book a demo/i }).first();
    await expect(demo).toBeVisible();
    const href = await demo.getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).toMatch(/^mailto:|^https?:\/\//);
  });
});
