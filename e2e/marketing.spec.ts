import { test, expect } from "@playwright/test";
import { PUBLIC_SURFACE_FORBIDDEN } from "@virlux/shared";
import { skipIfMarketingLander } from "./helpers";

const WEB_BASE =
  process.env.PLAYWRIGHT_WEB_URL ?? "https://virlux-web.vercel.app";

function assertNoDrift(text: string, pageName: string) {
  for (const { label, pattern } of PUBLIC_SURFACE_FORBIDDEN) {
    expect(text, `${pageName} must not expose "${label}"`).not.toMatch(pattern);
  }
}

test.describe("marketing site", () => {
  test.use({ baseURL: WEB_BASE });

  test("home page loads", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    skipIfMarketingLander(page);
    await expect(page.getByRole("link", { name: /VIRLUX/i }).first()).toBeVisible();
    assertNoDrift(await page.locator("body").innerText(), "home");
  });

  test("home product section", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    skipIfMarketingLander(page);
    await expect(page.locator("#product")).toBeVisible();
  });

  test("pricing page loads", async ({ page }) => {
    await page.goto("/pricing", { waitUntil: "networkidle" });
    skipIfMarketingLander(page);
    await expect(page.getByRole("heading", { name: /Pricing/i })).toBeVisible();
    assertNoDrift(await page.locator("body").innerText(), "pricing");
  });

  test("terms and privacy load", async ({ page }) => {
    await page.goto("/terms", { waitUntil: "networkidle" });
    skipIfMarketingLander(page);
    await expect(page.getByRole("heading", { name: /Terms of Service/i })).toBeVisible();
    await page.goto("/privacy", { waitUntil: "networkidle" });
    skipIfMarketingLander(page);
    await expect(page.getByRole("heading", { name: /Privacy Policy/i })).toBeVisible();
  });

  test("book demo CTA resolves", async ({ page }) => {
    await page.goto("/pricing", { waitUntil: "networkidle" });
    skipIfMarketingLander(page);
    const demo = page.getByRole("link", { name: /Book a demo/i }).first();
    await expect(demo).toBeVisible();
    const href = await demo.getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).toMatch(/^mailto:|^https?:\/\//);
  });
});
