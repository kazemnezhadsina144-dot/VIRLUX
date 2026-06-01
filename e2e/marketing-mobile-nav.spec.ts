import { test, expect } from "@playwright/test";

const WEB_URL = process.env.WEB_URL ?? "http://localhost:3100";

test.describe("Marketing mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("hamburger opens nav with product links", async ({ page }) => {
    await page.goto(WEB_URL);

    const menuButton = page.getByRole("button", { name: /open navigation menu/i });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    await expect(page.getByRole("link", { name: "Product" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pricing" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Demo" })).toBeVisible();

    await page.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(/\/pricing/);
  });
});
