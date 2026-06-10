import { test } from "@playwright/test";
import path from "node:path";
import { goToPage } from "./helpers";

const OUT = path.join(__dirname, "..", "apps", "web", "public", "screenshots");

test.describe("capture product screenshots", () => {
  test.use({ baseURL: process.env.PLAYWRIGHT_APP_URL ?? "http://localhost:3001" });

  test("overview", async ({ page }) => {
    test.skip(!process.env.E2E_DEMO_LOGIN, "Set E2E_DEMO_LOGIN=1 with seeded demo account");
    await goToPage(page, "/dashboard", /Overview|Dashboard/i);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(OUT, "overview.png"), fullPage: false });
  });

  test("send", async ({ page }) => {
    test.skip(!process.env.E2E_DEMO_LOGIN, "Set E2E_DEMO_LOGIN=1 with seeded demo account");
    await goToPage(page, "/dashboard/send", /Send payment/i);
    await page.locator('input[type="number"]').first().fill("500");
    await page.getByRole("button", { name: "Confirm rate" }).click();
    await page.getByText(/Recipient receives/i).waitFor({ timeout: 10000 });
    await page.screenshot({ path: path.join(OUT, "send.png"), fullPage: false });
  });

  test("payments", async ({ page }) => {
    test.skip(!process.env.E2E_DEMO_LOGIN, "Set E2E_DEMO_LOGIN=1 with seeded demo account");
    await goToPage(page, "/dashboard/transactions", /Payments/i);
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(OUT, "payments.png"), fullPage: false });
  });
});
