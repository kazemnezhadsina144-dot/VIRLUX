import { test, expect } from "@playwright/test";

test.describe("send payment flow", () => {
  test.use({ baseURL: process.env.PLAYWRIGHT_APP_URL ?? "http://localhost:3001" });

  async function loginAsDemo(page: import("@playwright/test").Page) {
    await page.goto("/");
    await page.getByLabel(/email/i).fill("demo@virlux.com");
    await page.getByLabel(/password/i).fill("demo12345");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  }

  test("quote and send payment", async ({ page }) => {
    test.skip(!process.env.E2E_DEMO_LOGIN, "Set E2E_DEMO_LOGIN=1 with local seed");

    await loginAsDemo(page);
    await page.getByRole("link", { name: "Send", exact: true }).click();
    await expect(page.getByRole("heading", { name: /Send payment/i })).toBeVisible();

    await page.getByRole("button", { name: "Confirm rate" }).click();
    await expect(page.getByText(/Recipient receives/i)).toBeVisible({ timeout: 10000 });

    await page.getByPlaceholder("Recipient name").fill("Pilot Supplier Ltd");
    await page.getByText("Recipient payout details").click();
    await page.getByPlaceholder("Bank or payout reference").fill("0x" + "a".repeat(40));
    await page.getByRole("button", { name: "Send payment" }).click();

    await expect(page.getByText(/Payment sent|status:/i)).toBeVisible({ timeout: 15000 });
  });

  test("middleware preserves next after login", async ({ page }) => {
    test.skip(!process.env.E2E_DEMO_LOGIN, "Set E2E_DEMO_LOGIN=1 with local seed");

    await page.goto("/dashboard/send");
    await expect(page).toHaveURL(/\?next=/, { timeout: 10000 });

    await page.getByLabel(/email/i).fill("demo@virlux.com");
    await page.getByLabel(/password/i).fill("demo12345");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/send/, { timeout: 15000 });
  });
});
