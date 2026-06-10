import { test, expect } from "@playwright/test";
import { skipIfMarketingLander } from "./helpers";

const WEB_URL =
  process.env.PLAYWRIGHT_WEB_URL ??
  process.env.WEB_URL ??
  "https://virlux-web.vercel.app";

test.describe("Marketing mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 }, baseURL: WEB_URL });

  test("hamburger opens nav with product links", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    skipIfMarketingLander(page);

    const menuButton = page.getByRole("button", { name: /open navigation menu/i });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const drawer = page.locator("nav.fixed");
    await expect(drawer.getByRole("link", { name: "Product" })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Pricing" })).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Demo", exact: true })).toBeVisible();

    await drawer.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(/\/pricing/);
  });
});
