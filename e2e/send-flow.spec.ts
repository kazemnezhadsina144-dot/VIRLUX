import { test, expect } from "@playwright/test";
import { resolveE2eDemoPassword } from "@virlux/shared";
import { loginAsDemo, loginFromNextRedirect, tryAddDemoFunds, goToSend } from "./helpers";

const DEMO_PASSWORD = resolveE2eDemoPassword();

test.describe("send payment flow", () => {
  test.describe.configure({ mode: "serial" });
  test.use({ baseURL: process.env.PLAYWRIGHT_APP_URL ?? "http://localhost:3001" });

  test("quote and send payment", async ({ page }) => {
    test.skip(!process.env.E2E_DEMO_LOGIN, "Set E2E_DEMO_LOGIN=1 with local seed");

    await tryAddDemoFunds(page);
    await goToSend(page);

    await page.getByRole("button", { name: "Confirm rate" }).click();
    await expect(page.getByText(/Recipient receives/i)).toBeVisible({ timeout: 10000 });

    await page.getByPlaceholder("Recipient name").fill("Pilot Supplier Ltd");
    await page.getByText("Recipient payout details").click();
    await page.getByPlaceholder("Bank or payout reference").fill("0x" + "a".repeat(40));
    await page.getByRole("button", { name: "Send payment" }).click();

    await expect(
      page.getByText(/Payment sent|awaiting approval|Pending approval|deposit is required/i)
    ).toBeVisible({ timeout: 15000 });
  });

  test.describe("unauthenticated redirect", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("middleware preserves next after login", async ({ page }) => {
      test.skip(!process.env.E2E_DEMO_LOGIN, "Set E2E_DEMO_LOGIN=1 with local seed");

      await loginFromNextRedirect(page, "/dashboard/send", "demo@virlux.com", DEMO_PASSWORD);
      await expect(page.getByRole("heading", { name: /Send payment/i })).toBeVisible({
        timeout: 15000,
      });
    });
  });
});
